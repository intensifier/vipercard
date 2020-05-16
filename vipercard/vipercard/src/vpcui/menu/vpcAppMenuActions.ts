
/* auto */ import { RememberHistory } from './../../vpc/vpcutils/vpcUtils';
/* auto */ import { getVpcSessionTools } from './../../vpc/request/vpcRequest';
/* auto */ import { VpcNonModalReplBox } from './../nonmodaldialogs/vpcReplMessageBox';
/* auto */ import { VpcNonModalFormBase } from './../nonmodaldialogs/vpcLyrNonModalHolder';
/* auto */ import { VpcStateInterface } from './../state/vpcInterface';
/* auto */ import { VpcNonModalFormSendReport } from './../nonmodaldialogs/vpcFormSendReport';
/* auto */ import { VpcNonModalFormLogin } from './../nonmodaldialogs/vpcFormLogin';
/* auto */ import { OrdinalOrPosition, VpcElType, VpcTool, checkThrow, checkThrowNotifyMsg } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { DialogDocsType, VpcNonModalDocViewer } from './../nonmodaldialogs/vpcDocViewer';
/* auto */ import { VpcAboutDialog } from './vpcAboutDialog';
/* auto */ import { VpcChangeSelectedFont } from './../../vpc/vel/velFieldChangeFont';
/* auto */ import { VpcElBg } from './../../vpc/vel/velBg';
/* auto */ import { VpcElBase } from './../../vpc/vel/velBase';
/* auto */ import { BrowserInfo, BrowserOSInfo, getRoot } from './../../ui512/utils/util512Higher';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { Util512, longstr } from './../../ui512/utils/util512';
/* auto */ import { UI512CompModalDialog } from './../../ui512/composites/ui512ModalDialog';
/* auto */ import { UI512BtnStyle } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { clrBlack, clrWhite } from './../../ui512/draw/ui512DrawPatterns';
/* auto */ import { lng } from './../../ui512/lang/langBase';

import { VpcVal } from '../../vpc/vpcutils/vpcVal';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * respond to menu actions
 */
export class VpcMenuActions {
    fontChanger: VpcChangeSelectedFont;
    save: VpcSaveInterface;
    msgBoxHistory = new RememberHistory();
    cbFindEditToolSelectedFldOrBtn: () => O<VpcElBase>;
    cbOnClearNonBrowseTool: () => void;
    constructor(protected vci: VpcStateInterface) {
        this.fontChanger = new VpcChangeSelectedFont();
    }

    /**
     * let's implement a lot of our menu commands in vipercard itself!
     * 1) don't need two implementations
     * 2) exposes more actions to scripts, i.e. doMenu
     * note: if you're not in the browse tool, we don't really want
     * a lot of code to run, so we use silenceMessagesForUIAction
     */
    runMenuActionCode(s: string) {
        this.vci.getCodeExec().silenceMessagesForUIAction.val = this.vci.getTool()
        this.vci.setTool(VpcTool.Browse)
        this.vci.getCodeExec().runMsgBoxCodeOrThrow(s, this.vci.getCurrentCardId(), false /* add return */);
    }

    /**
     * show about dialog
     */
    goMnuOSAbout() {
        let pr = this.vci.getPresenter();
        let dlg = new UI512CompModalDialog('OSAboutDlg');
        VpcAboutDialog.show(pr, dlg);
    }

    /**
     * show donate dialog
     */
    goMnuOSDonate() {
        let pr = this.vci.getPresenter();
        let dlg = new UI512CompModalDialog('OSAboutDlg');
        VpcAboutDialog.showDonateDlg(pr, dlg);
    }

    /**
     * show report error window
     */
    goMnuReportErr() {
        this.exitIfServerCodeInactive();
        if (getRoot().getSession()) {
            let dlg = new VpcNonModalFormSendReport(this.vci);
            this.vci.setNonModalDialog(dlg);
        } else {
            let form = new VpcNonModalFormLogin(this.vci, true /* newUserOk*/);
            VpcNonModalFormBase.standardWindowBounds(form, this.vci);
            form.fnCbWhenSignedIn = () => {
                this.goMnuReportErr();
            };

            this.vci.setNonModalDialog(form);
        }
    }

    /**
     * show "security info" dialog
     */
    goMnuReportSec() {
        this.showModal(
            longstr(`lngSecurity issues are taken seriously. If you are aware
                of an issue that has security{{NEWLINE}}implications, please
                contact the developers{{NEWLINE}}at security@vipercard.net.`)
        );
    }

    /**
     * show message box (repl)
     */
    goMnuMsgBox() {
        let dlg = new VpcNonModalReplBox(this.vci, this.msgBoxHistory);
        this.vci.setNonModalDialog(dlg);
    }

    /**
     * begin async save
     */
    goMnuSave() {
        if (!getVpcSessionTools().enableServerCode) {
            this.goMnuExportStack();
        } else {
            this.exitIfServerCodeInactive();
            if (this.save.busy) {
                console.log("Cannot start a new task until we've finished the other task.");
            } else {
                this.save.beginSave();
            }
        }
    }

    /**
     * begin save as
     */
    goMnuSaveAs() {
        this.exitIfServerCodeInactive();
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.beginSaveAs();
        }
    }

    /**
     * begin open (exits everything and goes back to start screen)
     */
    goMnuOpen() {
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.beginGoExit('mnuOpen');
        }
    }

    /**
     * share a link
     */
    goMnuShareALink() {
        this.exitIfServerCodeInactive();
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.beginShareLink();
        }
    }

    /**
     * create new stack
     */
    goMnuNewStack() {
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.beginGoExit('mnuNewStack');
        }
    }

    /**
     * export stack to json
     */
    goMnuExportStack() {
        /* *don't* use this.busy with this. need a way to
        recover if save() hangs for some reason. */
        this.save.beginExportJson();
    }

    /**
     * export to gif
     */
    goMnuExportGif() {
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.beginExportGif();
        }
    }

    /**
     * quit (to main screen)
     */
    goMnuQuit() {
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.beginGoExit('mnuQuit');
        }
    }

    /**
     * flag stack inappropriate content
     */
    goMnuFlagStack() {
        this.exitIfServerCodeInactive();
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.beginFlagContent();
        }
    }

    /**
     * use internal-only clipboard in case connection with os-clipboard isn't working
     */
    goMnuUseHostClipboard() {
        this.vci.setOption('optUseHostClipboard', !this.vci.getOptionB('optUseHostClipboard'));
        this.vci.getPresenter().useOSClipboard = this.vci.getOptionB('optUseHostClipboard');
    }

    /**
     * create new card
     */
    goMnuNewCard() {
        this.runMenuActionCode('doMenu "New Card"')
        //~ let currentCardId = this.vci.getModel().productOpts.getS('currentCardId');
        //~ let currentCard = this.vci.getModel().getCardById(currentCardId);
        //~ let currentBg = this.vci.getModel().getById(VpcElBg, currentCard.parentIdInternal);
        //~ let currentIndex = currentBg.cards.findIndex(cd => cd.idInternal === currentCardId);
        //~ let created = this.vci.getOutside().CreateCard(currentIndex === -1 ? 0 : currentIndex + 1);
        //~ this.vci.beginSetCurCardWithOpenCardEvt(OrdinalOrPosition.This, created.idInternal);
    }

    /**
     * duplicate current card
     */
    goMnuDupeCard() {
        this.runMenuActionCode('doMenu "Duplicate Card"')
        //~ /* can't use copy card/paste card since it's not yet impl'd */
        //~ /* use this workaround instead (only copies the paint) */
        //~ let currentCardId = this.vci.getOptionS('currentCardId');
        //~ let currentCard = this.vci.getModel().getCardById(currentCardId);
        //~ let paint = currentCard.getS('paint');
        //~ this.vci.setOption('selectedVelId', '');
        //~ this.goMnuNewCard();
        //~ currentCardId = this.vci.getOptionS('currentCardId');
        //~ currentCard = this.vci.getModel().getCardById(currentCardId);
        //~ currentCard.setOnVel('paint', paint, this.vci.getModel());
    }

    /**
     * show publish stack info
     */
    goMnuPublishFeatured() {
        this.exitIfServerCodeInactive();
        this.showModal(
            longstr(`lngYour project could be featured on ViperCard's
                front page! Save the project, choose 'Share a link' from
                the File menu, and send the link to @ViperCardDotNet on Twitter.`)
        );
    }

    /**
     * copy card or element
     */
    goMnuCopyCardOrVel() {
        let selected = this.cbFindEditToolSelectedFldOrBtn();
        if (selected) {
            this.vci.setOption('copiedVelId', selected.idInternal);
        } else {
            this.showModal('lngThis feature has not yet been developed.');
        }
    }

    /**
     * show about dialog
     * (another method, each menuitem must have an id that is unique)
     */
    goMnuOSAbout2() {
        this.goMnuOSAbout();
    }

    /**
     * create many buttons
     */
    goMnuCreateManyButtons() {
        let currentCardId = this.vci.getModel().productOpts.getS('currentCardId');
        let first = this.vci.createVel(currentCardId, VpcElType.Btn, 0, undefined);
        first.setOnVel('showlabel', false, this.vci.getModel());
        first.setOnVel('autohilite', false, this.vci.getModel());
        first.setOnVel('style', UI512BtnStyle.Transparent, this.vci.getModel());
        first.setOnVel('name', 'sprites_n' + 0, this.vci.getModel());
        first.setOnVel('script', '', this.vci.getModel());
        let firstidgot = first.idInternal;
        for (let i = 0; i < 200; i++) {
            let v = this.vci.createVel(currentCardId, VpcElType.Btn, 0, undefined);
            v.setOnVel('showlabel', false, this.vci.getModel());
            v.setOnVel('autohilite', false, this.vci.getModel());
            v.setOnVel('style', UI512BtnStyle.Transparent, this.vci.getModel());
            v.setOnVel('name', 'sprites_n' + 0, this.vci.getModel());
            v.setOnVel('script', '', this.vci.getModel());
        }

        this.showModal('lngFirst id: ' + firstidgot);
    }

    /**
     * delete current card
     * note that we have to move away from this card first before deleting it
     */
    goMnuDelCard() {
        this.runMenuActionCode('doMenu "Delete Card"')

        //~ if (this.vci.getTool() === VpcTool.Browse) {
        //~ /* previously, called a handler in productopts that
        //~ would move to a different card and delete the current card, but this is simpler */
        //~ this.vci.setTool(VpcTool.Button);
        //~ }

        //~ /* either go forwards or backwards, as long as we're somewhere else */
        //~ let wasCurrentCardId = this.vci.getModel().productOpts.getS('currentCardId');
        //~ let wasCurrentCard = this.vci.getModel().getCardById(wasCurrentCardId);
        //~ let otherCardId = this.vci.getModel().getCa7rdRelative(OrdinalOrPosition.Previous);
        //~ if (otherCardId === wasCurrentCardId) {
        //~ otherCardId = this.vci.getModel().getCa7rdRelative(OrdinalOrPosition.Next);
        //~ }

        //~ /* RemoveCard itself will do further checks, like preventing deleting the only card */
        //~ this.vci.setCurCardNoOpenCardEvt(otherCardId);
        //~ this.vci.getOutside().RemoveCard(wasCurrentCard);
        //~ checkThrow(false, 'nyi');
    }

    /**
     * toggle wide lines option
     */
    goMnuPaintWideLines() {
        this.runMenuActionCode('doMenu "Wide Lines"')
        //~ this.vci.setOption('optWideLines', !this.vci.getOptionB('optWideLines'));
    }

    /**
     * set black lines option
     */
    goMnuPaintBlackLines() {
        this.runMenuActionCode('doMenu "Black Lines"')
        //~ this.vci.setOption('optPaintLineColor', clrBlack);
    }

    /**
     * set white lines option
     */
    goMnuPaintWhiteLines() {
        this.runMenuActionCode('doMenu "White Lines"')
        //~ this.vci.setOption('optPaintLineColor', clrWhite);
    }

    /**
     * set black fill option
     */
    goMnuPaintBlackFill() {
        this.runMenuActionCode('doMenu "Black Fill"')
        //~ this.vci.setOption('optPaintFillColor', clrBlack);
    }

    /**
     * set white fill option
     */
    goMnuPaintWhiteFill() {
        this.runMenuActionCode('doMenu "White Fill"')
        //~ this.vci.setOption('optPaintFillColor', clrWhite);
    }

    /**
     * set no fill option
     */
    goMnuPaintNoFill() {
        this.runMenuActionCode('doMenu "No Fill"')
        //~ this.vci.setOption('optPaintFillColor', -1);
    }

    /**
     * set paint-multiple
     */
    goMnuPaintDrawMult() {
        this.runMenuActionCode('doMenu "Draw Multiple"')
        //~ this.vci.setOption('optPaintDrawMult', !this.vci.getOptionB('optPaintDrawMult'));
    }

    /**
     * show info about painting many copies
     */
    goMnuPaintManyCopies() {
        let keyname = BrowserInfo.get().os === BrowserOSInfo.Mac ? 'Option' : 'Alt';
        this.showModal(
            longstr(`lngTo make many of copies of a shape, first use the
                'lasso' or 'select' tool to select the region. Then, hold
                the ${keyname} key, click within the region, and drag.`)
        );
    }

    /**
     * cut, has to be done from keyboard
     */
    goMnuCut() {
        let keyname = BrowserInfo.get().os === BrowserOSInfo.Mac ? 'Cmd' : 'Ctrl';
        this.showModal(`lngPlease use the keyboard shortcut ${keyname}+X to \ncut text.`);
    }

    /**
     * copy, has to be done from keyboard
     */
    goMnuCopy() {
        let keyname = BrowserInfo.get().os === BrowserOSInfo.Mac ? 'Cmd' : 'Ctrl';
        this.showModal(`lngPlease use the keyboard shortcut ${keyname}+C to \ncopy text.`);
    }

    /**
     * paste, has to be done from keyboard
     */
    goMnuPaste() {
        let keyname = BrowserInfo.get().os === BrowserOSInfo.Mac ? 'Cmd' : 'Ctrl';
        this.showModal(`lngPlease use the keyboard shortcut ${keyname}+V to \npaste text.`);
    }

    /**
     * go to first card
     */
    goMnuGoCardFirst() {
        this.runMenuActionCode('doMenu "First"')
        //~ this.vci.beginSetCurCardWithOpenCardEvt(OrdinalOrPosition.First, undefined);
    }

    /**
     * go to last card
     */
    goMnuGoCardLast() {
        this.runMenuActionCode('doMenu "Last"')
        //~ this.vci.beginSetCurCardWithOpenCardEvt(OrdinalOrPosition.Last, undefined);
    }

    /**
     * go to the last card
     */
    goMnuGoCardLast__NewStyle() {
        /* an example of the new style of UI events.
        everything goes through running a script, even if the browse tool isn't active.
        we won't let other events through, though, because of silenceMessagesForUIAction. */
        this.vci.getCodeExec().silenceMessagesForUIAction.val = this.vci.getTool();
        let whichCmd = this.vci.getTool() === VpcTool.Browse ? 'domenu' : 'vpccalluntrappabledomenu';
        this.vci.getCodeExec().runMsgBoxCodeOrThrow(`${whichCmd} "last"`, this.vci.getCurrentCardId(), false);
    }

    /**
     * left arrow, usually go left but user can override
     */
    mnuOnArrowLeft() {
        this.runMenuActionCode('arrowkey "left"')
    }

    /**
     * right arrow, usually go right but user can override
     */
    mnuOnArrowRight() {
        this.runMenuActionCode('arrowkey "right"')
    }

    /**
     * up arrow, usually no-op but user can override
     */
    mnuOnArrowUp() {
        this.runMenuActionCode('arrowkey "up"')
    }

    /**
     * down arrow, usually no-op but user can override
     */
    mnuOnArrowDown() {
        this.runMenuActionCode('arrowkey "down"')
    }

    /**
     * go to previous card
     */
    goMnuGoCardPrev() {
        this.runMenuActionCode('doMenu "Prev", "FromUI"')
        //~ let cardNum = this.vci.getCurrentCardNum();
        //~ let msg = 'lngYou are already at the first card.';
        //~ if (cardNum <= 0) {
            //~ this.showModal(msg);
        //~ } else {
            //~ this.vci.beginSetCurCardWithOpenCardEvt(OrdinalOrPosition.Previous, undefined);
        //~ }
    }

    /**
     * go to the next card
     */
    goMnuGoCardNext() {
        this.runMenuActionCode('doMenu "Next", "FromUI"')
        //~ let cardNum = this.vci.getCurrentCardNum();
        //~ let totalCardNum = this.vci
            //~ .getModel()
            //~ .stack.bgs.map(bg => bg.cards.length)
            //~ .reduce(Util512.add);

        //~ if (cardNum >= totalCardNum - 1) {
            //~ let msg = longstr(`lngYou are at the last-most card. You can create
            //~ a new card by selecting 'New Card' from the Edit menu.`);
            //~ this.showModal(msg);
        //~ } else {
            //~ this.vci.beginSetCurCardWithOpenCardEvt(OrdinalOrPosition.Next, undefined);
        //~ }
    }

    /**
     * select and edit the card
     */
    goMnuCardInfo() {
        let currentCardId = this.vci.getOptionS('currentCardId');
        this.vci.setTool(VpcTool.Button);
        this.vci.setOption('selectedVelId', currentCardId);
        this.vci.setOption('viewingScriptVelId', '');
    }

    /**
     * select and edit the stack
     */
    goMnuStackInfo() {
        let currentstackid = this.vci.getModel().stack.idInternal;
        this.vci.setTool(VpcTool.Button);
        this.vci.setOption('selectedVelId', currentstackid);
        this.vci.setOption('viewingScriptVelId', '');
    }

    /**
     * new button
     */
    goMnuObjectsNewBtn() {
        this.runMenuActionCode('doMenu "New Button"')
        //~ this.makePart(VpcElType.Btn);
    }

    /**
     * new field
     */
    goMnuObjectsNewFld() {
        this.runMenuActionCode('doMenu "New Field"')
        //~ this.makePart(VpcElType.Fld);
    }

    /**
     * clear (either selected text or a tool-specific action)
     */
    goMnuClear() {
        if (this.vci.getTool() === VpcTool.Browse) {
            this.runMenuActionCode('doMenu "Clear"')
        } else {
            this.cbOnClearNonBrowseTool()
        }
    }

    /**
     * show help examples
     */
    goMnuDlgHelpExamples() {
        let dlg = new VpcNonModalDocViewer(this.vci, DialogDocsType.Examples);
        this.vci.setNonModalDialog(dlg);
    }

    /**
     * show complete script reference
     */
    goMnuDlgHelpReference() {
        let dlg = new VpcNonModalDocViewer(this.vci, DialogDocsType.Reference);
        this.vci.setNonModalDialog(dlg);
    }

    /**
     * user has chosen something without its own method
     */
    fallbackToSetToolOrSetFont(s: string) {
        if (s.startsWith('mnuItemTool')) {
            /* these can't go through doMenu, scripts can't set the current tool */
            let toolNumber = Util512.parseInt(s.substr('mnuItemTool'.length));
            toolNumber = toolNumber ?? VpcTool.Browse;
            this.vci.setTool(toolNumber);
        } else if (s.startsWith('mnuItemFont')) {
            let cmd = s.substr("mnuItemFont".length)
            if (this.vci.getTool() === VpcTool.Browse) {
                this.runMenuActionCode(`doMenu "${cmd}"`)
            } else {
                let vel = this.cbFindEditToolSelectedFldOrBtn();
                this.runMenuActionCode(`doMenu "${cmd}", "setAll", ${vel ? vel.getUserFacingId() : ""} `)
                //~ return this.fontChanger.runFontMenuActionsIfApplicable(s);
            }
        } else {
            console.error("Unknown menu item")
        }
    }

    /**
     * sometimes we disable saving to the server. you
     * can still save to json though.
     */
    protected exitIfServerCodeInactive() {
        checkThrowNotifyMsg(
            getVpcSessionTools().enableServerCode,
            'U2|Server code currently not enabled. You can still save as a .json file, though.'
        );
    }

    /**
     * show a modal dialog,
     * not an error at all but we just use this to enforce that
     * there's no other code run after showing the dialog
     * (code running after showing the dialog would be in a weird state)
     */
    protected showModal(untranslated: string) {
        checkThrowNotifyMsg(false, lng(untranslated));
    }
}

/**
 * asynchronous save methods
 */
export interface VpcSaveInterface {
    busy: boolean;
    beginSave(): void;
    beginSaveAs(): void;
    beginShareLink(): void;
    beginExportJson(): void;
    beginExportGif(): void;
    beginFlagContent(): void;
    beginGoExit(destination: string): void;
}
