
export class VpcStandardLibScript {
    static script = `
    `;

    static scriptFull = `
-- we don't need default handlers for "on mousedown" etc...
-- we have a list of handlers where it's always ok if they are missing (equivalent).
-- perhaps a slight benefit, because events like "idle" won't create a stack frame

-- "trappable" messages can go here.
-- note that they won't be trapped unless the current tool is the browse tool
on choose whichTool
    vpccalluntrappablechoose whichTool
end choose

on domenu a, b
    vpccalluntrappabledomenu a, b
end choose

on arrowkey direction
    if direction == "right" then
        go next
    end if
    if direction == "left" then
        go prev
    end if
end arrowkey

-- implementation of push and pop
on push
    global internalvpcpushimpl
    put return & the id of this cd after internalvpcpushimpl
end push

on pop actuallyMove
    global internalvpcpushimpl
    put internalvpcpushimplgetlastonstack(peekOnly) into theId
    if actuallyMove then
        go to cd id theId
    end if
    return the long name of cd id theId
end pop

function internalvpcpushimplgetlastonstack
    global internalvpcpushimpl
    if the number of lines of internalvpcpushimpl <= 1 then
        return the id of cd 1
    end if
    repeat with x = the number of lines of internalvpcpushimpl down to 1
        if there is a cd id (line x of internalvpcpushimpl) then
            put line x of internalvpcpushimpl into ret
            put line 1 to (x-1) of internalvpcpushimpl into internalvpcpushimpl
            return ret
        end if
    end repeat
    return the id of cd 1
end internalvpcpushimplgetlastonstack

-- it's simpler to send these messages in code

on internalvpcmovecardhelper nextId, shouldSuspendHistory
    -- cache card id in case another gotocard happens
    -- order confirmed for all of these, in the product
    put goCardDestinationFromObjectId(nextId) into nextCard
    put the short id of this cd into prevCard
    if cardId != nextCard and length(nextCard) then
        internalvpcmessagesdirective "closeorexitfield" prevCard
        send "closecard" to cd id prevCard
        if the id of the owner of cd id prevCard is not the id of the owner of cd id nextCard then
            send "closebackground" to cd id prevCard
        end if
        global internalvpcmovecardimplsuspendhistory
        if shouldSuspendHistory then
            put 1 into internalvpcmovecardimplsuspendhistory
        end if
        internalvpcmessagesdirective "gotocardsendnomessages" nextCard
        put 0 into internalvpcmovecardimplsuspendhistory
        if the id of the owner of cd id prevCard is not the id of the owner of cd id nextCard then
            send "openbackground" to cd id nextCard
        end if
        send "opencard" to cd id nextCard
    end if
    if length(nextCard) then
        return ""
    else
        return "No such card"
    end if
end internalvpcmovecardhelper

function goCardDestinationFromObjectId nextId
    -- also checks for existence.
    put typeOfObject(nextId) into objType
    if objType == "card" then
        return nextId
    else if objType == "bkgnd" then
        if the id of the owner of this cd is nextId then
            return the id of this cd
        else
            return the id of cd 1 of bkgnd id nextId
        end if
    else if objType == "stack" then
        return the id of this cd
    else
        return ""
    end if
end goCardDestinationFromObjectId

--on internalvpcnewbghelper
--    put the short id of this cd into prevCard
--    internalvpcmessagesdirective "closeorexitfield" prevCard
--    send "closecard" to cd id prevCard
--    send "closebackground" to cd id prevCard
--    internalvpcmessagesdirective "makenewbgsendnomessages"
--    put the result into nextCard
--    internalvpcmessagesdirective "gotocardsendnomessages" nextCard
--    send "newbackground" to cd id nextCard
--    send "newcard" to cd id nextCard
--    send "openbackground" to cd id nextCard
--    send "opencard" to cd id nextCard
--end internalvpcnewbghelper
--
--on internalvpcnewcdhelper
--    put the short id of this cd into prevCard
--    internalvpcmessagesdirective "closeorexitfield" prevCard
--    send "closecard" to cd id prevCard
--    internalvpcmessagesdirective "makenewcdsendnomessages"
--    put the result into nextCard
--    internalvpcmessagesdirective "gotocardsendnomessages" nextCard
--    send "newcard" to cd id nextCard
--    send "opencard" to cd id nextCard
--end internalvpcnewcdhelper



       `;
}
