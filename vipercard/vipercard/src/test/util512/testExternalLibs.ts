
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, assertEq } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection, assertThrows } from './../testUtils/testUtils';

let t = new SimpleUtil512TestCollection('testCollectionExternalLibs');
export let testCollectionExternalLibs = t;

t.test('PizzicatoExists', () => {
    assertTrue(Pizzicato, 'O/|pizzicato not found');
});

t = new SimpleUtil512TestCollection('testCollectionUtil512LessUsefulLibs');
export let testCollectionUtil512LessUsefulLibs = t;

t.test('LockableArr', () => {
    t.say(/*——————————*/ 'standard use');
    let ar = new Util512.LockableArr<number>();
    ar.set(0, 55);
    ar.set(1, 56);
    assertEq(55, ar.at(0), 'OS|');
    assertEq(56, ar.at(1), 'OR|');
    assertEq(2, ar.len(), 'OQ|');
    ar.lock();
    assertThrows('OP|', 'locked', () => {
        ar.set(1, 57);
    });
    t.say(/*——————————*/ "changing the copy won't change original");
    let copy = ar.getUnlockedCopy();
    assertEq(55, copy.at(0), 'OO|');
    assertEq(56, copy.at(1), 'ON|');
    assertEq(2, copy.len(), 'OM|');
    copy.set(1, 57);
    assertEq(57, copy.at(1), 'OL|');
    assertEq(56, ar.at(1), 'OK|');
});
t.test('keepOnlyUnique', () => {
    assertEq([], Util512.keepOnlyUnique([]), 'OJ|');
    assertEq(['1'], Util512.keepOnlyUnique(['1']), 'OI|');
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '3']), 'OH|');
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '2', '3']), 'OG|');
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '3', '3']), 'OF|');
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '2', '3', '2']), 'OE|');
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '2', '3', '3']), 'OD|');
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '3', '2', '3']), 'OC|');
    assertEq(
        ['11', '12', '13', '14', '15'],
        Util512.keepOnlyUnique(['11', '12', '13', '14', '15', '15']),
        'OB|'
    );
});

declare let Pizzicato: any;