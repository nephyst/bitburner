import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    ns.disableLog("sleep");
    ns.disableLog("getHackingLevel");

    loop: while (true) {
        ns.print("---");
        await ns.sleep(5000);

        // Try Creating Scripts
        await createScript("BruteSSH.exe", 50);
        await createScript("FTPCrack.exe", 100);
        await createScript("relaySMTP.exe", 250);
        await createScript("HTTPWorm.exe", 500);
        await createScript("SQLInject.exe", 750);

        {
            // Get hacking level to 250
            let work = ns.singularity.getCurrentWork();
            if (ns.getHackingLevel() <= 250) {
                if (!work || work.type !== "CRIME" || work.crimeType !== "Rob Store") {
                    ns.singularity.commitCrime("Rob Store", ns.singularity.isFocused());
                }
                continue;
            }
        }

        let player = ns.getPlayer();
        let playerAugs = ns.singularity.getOwnedAugmentations(true);

        // Stay in Sector-12 for CashRoot Starter Kit
        // TDH for Neuroreceptor Management Implant Augmentation
        let needSector12 = needsRepForAugment("Sector-12") && !player.factions.includes("Sector-12");
        let needsTDH = needsRepForAugment("Tian Di Hui") && !player.factions.includes("Tian Di Hui");
        if (needsTDH && !needSector12 && player.city !== "New Tokyo") {
            ns.singularity.travelToCity("New Tokyo");
        }

        // Join factions
        faction: for (let faction of ns.singularity.checkFactionInvitations()) {
            for (let aug of ns.singularity.getAugmentationsFromFaction(faction)) {
                if (!playerAugs.includes(aug)) {
                    ns.toast(sprintf("Joining %s due to missing %s", faction, aug), "info", 10000);
                    ns.singularity.joinFaction(faction);
                    continue faction;
                }
            }
        }

        // Filter out factions where reputation is high enough to afford all augmentations
        let factionsToGrind = player.factions
            .reverse()
            .filter((faction) => needsRepForAugment(faction));

        // Grind Faction Rep
        let doingWork = false;
        for (let shouldGrindReputation of [favorBelow(20), favorBelow(70), favorBelow(150), () => true]) {
            for (let faction of factionsToGrind) {
                var grindRep = shouldGrindReputation(faction);
                if (grindRep) {
                    let work = ns.singularity.getCurrentWork();
                    if (!work || work.type !== "FACTION" || work.factionName !== faction) {
                        let hacking = ns.singularity.workForFaction(faction, "hacking", ns.singularity.isFocused());
                        if (!hacking) {
                            ns.print("hacking failed");
                            continue;
                        }
                    }
                    ns.printf(" %s: hacking", faction);
                    continue loop;
                }
            }
        }

        // Default to Homicide to lower karma
        if (!doingWork) {
            let work = ns.singularity.getCurrentWork();
            if (!work || work.type !== "CRIME" || work.crimeType !== "Homicide") {
                ns.singularity.commitCrime("Homicide", ns.singularity.isFocused());
            }
        }
    }

    function favorBelow(favorTarget) {
        return (faction) => {
            let favor = ns.singularity.getFactionFavor(faction);
            let favorGain = ns.singularity.getFactionFavorGain(faction);
            let isFavorBelow = favor + favorGain < favorTarget
            ns.printf(" %s [%s < favorBelow(%s)] %s", faction, favor + favorGain, favorTarget, isFavorBelow);
            return isFavorBelow;
        }
    }

    function needsRepForAugment(faction) {
        let playerAugs = ns.singularity.getOwnedAugmentations(true);
        let factionRep = ns.singularity.getFactionRep(faction) + ns.singularity.getFactionFavorGain(faction);

        for (let aug of ns.singularity.getAugmentationsFromFaction(faction)) {
            if (playerAugs.includes(aug)) {
                continue;
            }
            let augRepCost = ns.singularity.getAugmentationRepReq(aug);
            ns.printf(" %s [%s] Reputation: %s / %s", faction, aug, ns.formatNumber(factionRep, 2), ns.formatNumber(augRepCost));
            if (augRepCost > factionRep) {
                return true;
            }
        }
        return false;

    }

    // Helper function to manually create a script
    async function createScript(file, hackingLevel) {
        if (ns.getHackingLevel() < hackingLevel) {
            return;
        }

        while (!ns.fileExists(file)) {
            let work = ns.singularity.getCurrentWork();
            if (!work || work.type !== "CREATE_PROGRAM" || work.programName !== file) {
                ns.singularity.createProgram(file, ns.singularity.isFocused());
            }
            await ns.sleep(10000);
        }
    }
}
