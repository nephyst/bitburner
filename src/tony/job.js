import { CompanyName, FactionWorkType, NS } from "@ns";
/** @param {NS} ns */
export async function main(ns) {
  while (true) {
      
    // interface Person {
    //   hp: HP;
    //   skills: Skills;
    //   exp: Skills;
    //   mults: Multipliers;
    //   city: CityName;
    // }

    // interface Player extends Person {
    //   money: number;
    //   numPeopleKilled: number;
    //   entropy: number;
    //   jobs: Partial<Record<CompanyName, JobName>>;
    //   factions: string[];
    //   totalPlaytime: number;
    //   location: string;
    // }
    
    // let myCompany = CompanyName.ECorp;
    // if (ns.singularity.getCompanyFavorGain(myCompany) < 0.2) {
    //   myCompany = CompanyName.MegaCorp;
    // }
    // workForCompany(myCompany);

      let company = ns.args[0];
      // Stop action so script can read Company/Faction rep accurately 
      ns.singularity.stopAction();
      // Rob Stores until hacking level is above 150
      if (ns.getHackingLevel() < 250) {
        // ns.singularity.commitCrime("Rob Store", false);
        ns.singularity.workForFaction("CyberSec", FactionWorkType.hacking, false)
      }
      // Get and work IT job to build rep for software job
      if (ns.getHackingLevel() >= 250 && ns.getHackingLevel() < 300) {
        ns.singularity.applyToCompany("ECorp", "it");
        if (ns.singularity.getCompanyRep("ECorp") < 400010) {
          ns.singularity.workForCompany("ECorp", false);
        }
      }
      // Switch to Software Job 
      if (ns.getHackingLevel() >= 300 && ns.singularity.getCompanyRep(CompanyName.ECorp) >= 8000) {
        ns.singularity.applyToCompany(CompanyName.ECorp, "software");
        if (ns.singularity.getCompanyRep(CompanyName.ECorp) < 400010) {
          ns.singularity.workForCompany("ECorp", false);
        }
      }
      // Watch for invite from ECorp and then join and start hacking job
      let invites = ns.singularity.checkFactionInvitations();
      let incecorp = invites.includes("ECorp", -1);
      if (incecorp = true) {
        ns.singularity.joinFaction("ECorp");
        ns.singularity.workForFaction("ECorp", "hacking", false);
      }
      if (ns.singularity.getFactionRep("ECorp") > 1625010) {
        ns.singularity.workForFaction("Fulcrum Secret Technologies", "hacking", false);
      }
      await ns.sleep(10000);
    }
  }