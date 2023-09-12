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
            await ns.sleep(60000);
        }

        let length = files.length;
        for (let i = length - 1; i >= 0; i--) {
            let file = files[i];
            if (!ns.fileExists(file)) {
                ns.singularity.purchaseProgram(file);
                if (ns.fileExists(file)) {
                    ns.toast(sprintf("Purchased %s", file));
                    files.splice(i, 1);
                }
            }
        }   

        await ns.sleep(60000);
    }

    ns.toast("All files purchased.");
}