/** @param {NS} ns */
export async function main(ns) {

    let files = [
        "DeepscanV2.exe", //25m
        "AutoLink.exe", //1m
        "DeepscanV1.exe", //500k
        "ServerProfiler.exe", //500k

        "SQLInject.exe", //250m
        "HTTPWorm.exe", //30m
        "relaySMTP.exe", //5m
        "FTPCrack.exe", //1.5m
        "BruteSSH.exe" //500k
    ]

    while (files.length > 0) {
        while (!ns.hasTorRouter()) {
            ns.singularity.purchaseTor(true);
            await ns.sleep(10000);
        }

        let length = files.length;
        for (let i = length - 1; i >= 0; i--) {
            let file = files[i];
            if (!ns.fileExists(file)) {
                ns.singularity.purchaseProgram(file);
                if (ns.fileExists(file)) {
                    ns.toast(sprintf("Purchased %s", file), "info", 20000);
                    files.splice(i, 1);
                }
            } else {
                ns.toast(sprintf("Already have %s", file), "info", 20000);
                files.splice(i, 1);
            }
        }   

        await ns.sleep(10000);
    }

    ns.toast("All files purchased.");
}