import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    while (true) {

        let player = ns.getPlayer();
        let playerAugs = ns.singularity.getOwnedAugmentations(true);

        let TDH = "Tian Di Hui";
        if (!player.factions.includes(TDH) && player.city !== "New Tokyo") {
            for (let aug of ns.singularity.getAugmentationsFromFaction(TDH)) {
                if (!playerAugs.includes(aug)) {
                    ns.singularity.travelToCity("New Tokyo");
                    break;
                }
            }
        }

        faction: for (let faction of ns.singularity.checkFactionInvitations()) {
            ns.printf("Possible faction: %s", faction);
            for (let aug of ns.singularity.getAugmentationsFromFaction(faction)) {
                if (!playerAugs.includes(aug)) {
                    ns.toast(sprintf("Joining %s due to missing %s", faction, aug), "info", 10000);
                    ns.singularity.joinFaction(faction);
                    continue faction;
                }
            }
        }

        let doingWork = false;
        for (let faction of player.factions) {
            ns.printf("Checking player faction: %s", faction);
            let favor = ns.singularity.getFactionFavor(faction);
            let favorGain = ns.singularity.getFactionFavorGain(faction);

            if (favor + favorGain > 150
                || (favor > 20 && favorGain > 50)
                || (favor == 0 && favorGain > 20)) {
                ns.printf("Skipping %s: favor: %s; favorGain: %s", faction, favor, favorGain);
                continue;
            }

            let work = ns.singularity.getCurrentWork();
            if (work.type !== "FACTION" || work.factionName !== faction) {
                ns.printf("Working for %s", faction);
                ns.singularity.workForFaction(faction, "hacking", false);
            }
            doingWork = true;
            break;
        }

        if (!doingWork) {
            let work = ns.singularity.getCurrentWork();
            if (work.type !== "CRIME" || work.crimeType !== "Rob Store") {
                ns.singularity.commitCrime("Rob Store", false);
            }
            //ns.singularity.commitCrime("Assassination", false);
        }

        await ns.sleep(60000);
    }



    // async function tianDiHui() {
    //     let name = "Tian Di Hui";

    //     //Faction Goal
    //     let augs = ns.singularity.getOwnedAugmentations(true);
    //     if (augs.includes("Neuroreceptor Management Implant")) {
    //         return;
    //     }

    //     //Join Faction
    //     let player = ns.getPlayer();
    //     while (!player.factions.includes(name)) {

    //         if (ns.singularity.checkFactionInvitations().includes(name)) {
    //             ns.singularity.joinFaction(name);
    //             continue;
    //         }

    //         //City
    //         if (player.city != "New Tokyo") {
    //             ns.singularity.travelToCity("New Tokyo");
    //         }

    //         let work = ns.singularity.getCurrentWork();
    //         if (work.type !== "CRIME" || work.crimeType !== "Rob Store") {
    //             ns.singularity.commitCrime("Rob Store");
    //         }

    //         await ns.sleep(5000);
    //         player = ns.getPlayer();
    //     }

    //     ns.singularity.workForFaction(name, "hacking");

    // }

}