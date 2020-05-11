
/* auto */ import { TestVpcScriptRunBase } from './vpcTestScriptRunBase';
/* auto */ import { checkThrowInternal } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { SimpleUtil512TestCollection, YetToBeDefinedTestHelper } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let t = new SimpleUtil512TestCollection('testCollectionScriptExtensiveChunk', true);
export let testCollectionScriptExtensiveChunk = t;

let h = YetToBeDefinedTestHelper<TestVpcScriptRunBase>();
t.atest('--init--testCollectionScriptExtensive', async () => {
    h = new TestVpcScriptRunBase(t);
    return h.initEnvironment();
});
t.atest('runConditionalTests', async () => {
    h.vcstate.vci.undoableAction(()=>
        h.vcstate.model.stack.setOnVel('compatibilitymode', true, h.vcstate.model))
    let test = new RunExtensiveChunkTests();
    await test.go();
    h.vcstate.vci.undoableAction(()=>
        h.vcstate.model.stack.setOnVel('compatibilitymode', false, h.vcstate.model))
});

/**
 * I decided to thoroughly test chunk support by
 * writing a python script to generate thousands of examples,
 * running the examples on the original product in an emulator,
 * then running the script in vipercard and comparing them.
 */
class RunExtensiveChunkTests {
    failures = 0
    async loadTestData() {
        let url = '/resources03a/test/testScriptExtensiveChunkTests.txt';
        let txt = await Util512Higher.asyncLoadJsonString(url);
        let data = txt.trim().replace(/\r\n/g, '\n').split('\n');
        return data;
    }

    /* runs the test */
    async go() {
        /* let's run it in batches of 40 */
        const batchSize = 40
        let count = 0;
        let data = await this.loadTestData();
        while(true) {
            /* release our timeslice for a bit so the ui doesn't freeze */
            if (count % batchSize*5 === 0) {
                await Util512Higher.sleep(10);
                console.log(count, '...');
            }

            if (!data.length) {
                console.log(`extensive chunk tests done with ${count} tests, ${this.failures} failures.`)
                return
            }

            let batch:string[] = []
            for (let i=0; i<batchSize; i++) {
                let last = data.pop()
                if (last && last.length) {
                    //~ if (!last.includes(' to')) {
                    if (last.split('of').length === 2) {
                        batch.push(last)
                        count += 1
                    }
                } else {
                    break
                }
            }

            this.doTests(batch, count)
        }
    }

    doTests(batch:string[], count:number) {
        /* placeholder text so that an empty batch is ok */
        let code = 'put 1 into x'
        let expecteds:string[] = []
        let i = 0
        for (let entry of batch) {
            i++
            let pts = entry.split('|')
            assertTrue(pts.length === 4, "not 4 parts?", entry)
            expecteds.push(pts[3])
            let targetStringForInput = `"${pts[2]}"`
            targetStringForInput = targetStringForInput.replace(/"\\n/, 'return & "')
            targetStringForInput = targetStringForInput.replace(/\\n"/, '" & return')
            targetStringForInput = targetStringForInput.replace(/\\n/g, '" & return & "')
            code += `\nglobal results${i}`
            if (pts[0]==='READ') {
                code += `\nput ${targetStringForInput} into z`
                code += `\nput ${pts[1]} z into results${i}`
            } else if (pts[0]==='WRITE') {
                code += `\nput ${targetStringForInput} into results${i}`
                code += `\nput "ABCDE" into ${pts[1]} results${i}`
            } else if (pts[0]==='DELETE') {
                code += `\nput ${targetStringForInput} into results${i}`
                code += `\ndelete ${pts[1]} results${i}`
            } else {
                checkThrowInternal(false, "unknown test")
            }
        }

        h.runGeneralCode('', code);
        for (let i=0; i<expecteds.length; i++) {
            let got = h.vcstate.runtime.codeExec.globals.get(`results${i + 1}`).readAsString();
            got = got.replace(/\n/g, "\\n")
            if (got !== expecteds[i]) {
                if (this.failures === 0) {
                    console.error("| refers to a newline and _ is a space in this output.")
                }

                console.error(`FAILURE near test # ${count}`)
                console.error('Test: ' + batch[i].split('|').join('\n').replace(/\\n/g, '|').replace(/ /g, '_'))
                console.error('Got: \n' + got.replace(/\\n/g, '|').replace(/ /g, '_'))
                this.failures+=1
            }
        }
    }
}
