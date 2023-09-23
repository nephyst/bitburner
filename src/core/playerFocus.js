import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    ns.disableLog("sleep");
    ns.disableLog("getHackingLevel");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("singularity.workForFaction");

    let player = ns.getPlayer();

    ns.tprint(player.factions);

    let factionNameLength = player.factions
        ? player.factions.reduce((a, b) => a.length > b.length ? a : b, "").length
        : 0; 

    loop: while (true) {
        await ns.sleep(5000);
        ns.printf("\n");

        // Try Creating Scripts
        await createScript("BruteSSH.exe", 50);
        await createScript("FTPCrack.exe", 100);
        await createScript("relaySMTP.exe", 250);
        await createScript("HTTPWorm.exe", 500);
        await createScript("SQLInject.exe", 750);

        
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
                    ns.toast(sprintf("Joining %s [missing %s]", faction, aug), "info", 10000);
                    ns.singularity.joinFaction(faction);
                    continue faction;
                }
            }
        }

        player = ns.getPlayer();
        factionNameLength = player.factions.reduce((a, b) => a.length > b.length ? a : b, "").length;

        //ns.printf("Factions with augments:");
        // Filter out factions where reputation is high enough to afford all augmentations
        let factionsToGrind = player.factions
            .reverse()
            // filter gangs with no work
            .filter((faction) => {
                let filter = !["Shadows of Anarchy"].includes(faction)
                if (!filter) {
                    ns.printf(" %s [skipped]", faction.padStart(factionNameLength));
                }
                return filter;
            })
            // dont if gang
            .filter((faction) => {
                let gang = !ns.gang.inGang() || ns.gang.getGangInformation()?.faction !== faction
                if (!gang) {
                    ns.printf(" %s [gang]", faction.padStart(factionNameLength));
                }
                return gang;
            })
            // dont if we already have enough rep, or all augs
            .filter((faction) => {
                let needsRep = needsRepForAugment(faction, true);
                if (!needsRep) {
                    ns.printf(" %s [complete]", faction.padStart(factionNameLength));
                }
                return needsRep;
            })
            // try to spend money
            .map((faction) => { attemptToDonate(faction); return faction; });

        //ns.printf("Grind faction rep:");
        // Grind Faction Rep
        let doingWork = false;
        for (let shouldGrindReputation of [
            (faction) => { return favorBelow(50)(faction) && purchasableAugs(1)(faction); },
            (faction) => { return favorBelow(150)(faction) && purchasableAugs(4)(faction); },
            purchasableAugs(99)
        ]) {
            for (let faction of factionsToGrind) {
                var grindRep = shouldGrindReputation(faction);
                if (grindRep) {
                    let work = ns.singularity.getCurrentWork();
                    if (work && work.factionName == faction) {
                        continue loop;
                    }

                    let hacking = ns.singularity.workForFaction(faction, "hacking", ns.singularity.isFocused());
                    if (hacking) {
                        ns.printf(" %s: hacking", faction.padStart(factionNameLength));
                        continue loop;
                    }
                    let fieldWork = ns.singularity.workForFaction(faction, "field", ns.singularity.isFocused());
                    if (fieldWork) {
                        ns.printf(" %s: field work", faction.padStart(factionNameLength));
                        continue loop;
                    }

                    let securityWork = ns.singularity.workForFaction(faction, "security", ns.singularity.isFocused());
                    if (securityWork) {
                        ns.printf(" %s: security work", faction.padStart(factionNameLength));
                        continue loop;
                    }
                    ns.printf(" %s Failed All WorkTypes", faction.padStart(factionNameLength));
                }
            }
        }

        // Default to Homicide to lower karma
        if (!doingWork) {
            let work = ns.singularity.getCurrentWork();
            if (ns.getHackingLevel() <= 100) {
                if (!work || work.type !== "CRIME" || work.crimeType !== "Rob Store") {
                    ns.singularity.commitCrime("Rob Store", ns.singularity.isFocused());
                }
                continue;
            } else if (ns.heart.break() > -54000) {
                if (!work || work.type !== "CRIME" || work.crimeType !== "Homicide") {
                    ns.singularity.commitCrime("Homicide", ns.singularity.isFocused());
                }
            } else {
                if (!work || work.type !== "CRIME" || work.crimeType !== "Heist") {
                    ns.singularity.commitCrime("Heist", ns.singularity.isFocused());
                }
            }
        }
    }

    function purchasableAugs(n) {
        return (faction) => {
            let playerAugs = ns.singularity.getOwnedAugmentations(true);
            let factionRep = ns.singularity.getFactionRep(faction);

            let augsForSale = ns.singularity.getAugmentationsFromFaction(faction)
                .filter((aug) => !playerAugs.includes(aug));
            let affordableAugs = augsForSale.filter((aug) => ns.singularity.getAugmentationRepReq(aug) < factionRep);
            if (n > augsForSale.length) {
                n = augsForSale.length;
            }

            let hasNPurchasableAugs = affordableAugs.length < n;

            ns.printf(" %s [%s / %s augs]", faction.padStart(factionNameLength), affordableAugs.length, n);

            return hasNPurchasableAugs;
        }
    }

    function favorBelow(favorTarget) {
        return (faction) => {
            let favor = ns.singularity.getFactionFavor(faction);
            let favorGain = ns.singularity.getFactionFavorGain(faction);
            let isFavorBelow = favor + favorGain < favorTarget
            ns.printf(" %s [%s / %s favor]", faction.padStart(factionNameLength), ns.formatNumber(favor + favorGain, 2), favorTarget);
            return isFavorBelow;
        }
    }

    function attemptToDonate(faction) {
        let money = ns.getServerMoneyAvailable("home");
        if (ns.singularity.getFactionFavor(faction) > 150 && money > 1e9) {
            ns.singularity.donateToFaction(faction, money);
        }
        return true;
    }

    function needsRepForAugment(faction, debug = false) {
        let playerAugs = ns.singularity.getOwnedAugmentations(true);
        let factionRep = ns.singularity.getFactionRep(faction);

        let factionAugs = ns.singularity.getAugmentationsFromFaction(faction)
            .filter((aug) => !playerAugs.includes(aug));

        // Why this no work?
        let sorted = factionAugs.sort((a, b) => {
            let left = ns.singularity.getAugmentationRepReq(a);
            let right = ns.singularity.getAugmentationRepReq(b);
            return left - right;
        });
        for (let aug of sorted) {
            let augRepCost = ns.singularity.getAugmentationRepReq(aug);
            if (augRepCost > factionRep) {
                if (debug) {
                    ns.printf(" %s [%s / %s rep] %s", faction.padStart(factionNameLength), ns.formatNumber(factionRep, 2), ns.formatNumber(augRepCost, 2), aug);
                }
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
