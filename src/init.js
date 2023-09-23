import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    ns.singularity.commitCrime("Rob Store", false);

    let isShare = ns.isRunning("/hack/helper/share.js", "home");
    if (isShare) {
        ns.kill("/hack/helper/share.js");
    }

    await runScript("/hack/deployer.js");
    await runScript("/core/hacknet.js");
    await runScript("/core/pservers.js");
    await runScript("/core/home.js");
    await runScript("/core/tor.js");
    await runScript("/core/playerFocus.js");
    await runScript("/core/backdoor.js", ["loop"]);
    await runScript("/core/stock.js");
    await runScript("/core/gang.js");

    await unMaxThreads("/hack/helper/share.js")
        
    async function runScript(script, args = []) {
        let running = ns.isRunning(script, "home", ...args);
        if (!running) {
            //if (args && args.length > 0) {
                ns.run(script, 1, ...args);
            //} else {
            //    ns.run(script);
            //};
            ns.toast(sprintf("Staring %s", script));
            await ns.sleep(33);
            running = ns.isRunning(script, "home", ...args);
        }
        return running;
    }

    async function unMaxThreads(script) {
        let ramPerThread = ns.getScriptRam(script);
        let ramAvailable = ns.getServerMaxRam("home") - ns.getServerUsedRam("home") - 22;
        ns.tprint(ramAvailable);
        let threads = Math.floor(ramAvailable / ramPerThread);
    
        if (threads > 0) {
            ns.toast(sprintf("Staring %s %s", script, threads));
            ns.run(script, threads);
        }
    }
}