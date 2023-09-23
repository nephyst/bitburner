import { NS } from "@ns";
/** @param {NS} ns **/
export async function main(ns) {

    ns.disableLog("sleep");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("stock.buyStock");
    ns.disableLog("stock.sellStock");

    let total = 0;

    while (true) {
        await ns.sleep(10000);

        if (!ns.stock.hasWSEAccount()) {
            ns.stock.purchaseWseAccount();
            continue;
        }

        if (!ns.stock.hasTIXAPIAccess()) {
            ns.stock.purchaseTixApi();
            continue;
        }

        if (!ns.stock.has4SData()) {
            ns.stock.purchase4SMarketData();
            continue;
        }

        if (!ns.stock.has4SDataTIXAPI()) {
            ns.stock.purchase4SMarketDataTixApi();
            continue;
        }

        let symbols = ns.stock.getSymbols();
        let maxForecast = 0;
        let portfolioValue = 0;
        for (let symbol of symbols) {
            let forecast = ns.formatNumber(ns.stock.getForecast(symbol) * 100, 1);
            if (forecast > maxForecast) {
                maxForecast = forecast;
            }
            let position = ns.stock.getPosition(symbol);
            let money = ns.getServerMoneyAvailable("home");
            let value = ns.formatNumber(position[0] * ns.stock.getPrice(symbol), 2);
            let shares = ns.formatNumber(position[0], 2).padStart(7, " ");
            let base = ns.formatNumber(position[0] * position[1], 2);

            if (position[0] > 0) {
                ns.printf("%s %s%% %s $%s => $%s", symbol.padStart(4), forecast.padStart(5), shares, base, value);
            }

            if (forecast > 65) {
                if (position[0] == 0) {
                    ns.printf("%s %s%% %s $%s => $%s", symbol.padStart(4), forecast.padStart(5), shares, base, value);
                }
                let price = ns.stock.getPrice(symbol);
                let count = Math.min((money * 0.1) / price, ns.stock.getMaxShares(symbol) - position[0]);
                price = ns.stock.buyStock(symbol, count);
                let totalCost = count * price;
                if (totalCost > 0) {
                    totalCost += ns.stock.getConstants().StockMarketCommission;
                    ns.printf("    BUY %s at $%s/share for $%s", ns.formatNumber(count, 2), ns.formatNumber(price, 2), ns.formatNumber(totalCost, 2));
                    total -= totalCost;
                }
            } else if (position[0] > 0 && forecast < 55) {
                let initialCost = position[0] * position[1];
                let price = ns.stock.sellStock(symbol, position[0]);
                let profit = position[0] * price;
                if (profit > 0) {
                    profit -= - ns.stock.getConstants().StockMarketCommission;
                    let net = profit - initialCost;
                    ns.printf("   SELL %s at $%s/share for $%s; ~$%s/share = $%s", ns.formatNumber(position[0], 2), ns.formatNumber(price, 2), ns.formatNumber(profit, 2), ns.formatNumber(position[1], 2), ns.formatNumber(net, 2));
                }
                total += profit;
            }
            portfolioValue += ns.stock.getPosition(symbol)[0] * ns.stock.getPrice(symbol);
        }
        ns.printf("Total: $%s; Value: %s; Max: %s%%\n ", ns.formatNumber(total), ns.formatNumber(portfolioValue), maxForecast);
    }

}


/**
 * 
MGCP  69.7%  14.86k $563.66m => $567.09m
    BUY 3.35k at $38.31k/share for $128.46m
FSIG  66.9%   5.98k $507.45m => $512.89m
    BUY 1.34k at $86.24k/share for $115.68m
FLCM  69.1%  11.40k $458.15m => $455.13m
    BUY 2.59k at $40.27k/share for $104.47m
Total: $-1.883b; Value: 1.881b; Max: 69.7%
 
 ECP  69.2%    0.00 $0.00 => $0.00
    BUY 4.50k at $21.63k/share for $97.53m
MGCP  30.2%  18.21k $692.04m => $700.12m
   SELL 18.21k at $38.29k/share for $697.42m; Average cost: $38.00k/share, Net $-5.38m
FSIG  66.6%   7.32k $623.02m => $637.42m
    BUY 1.80k at $87.55k/share for $157.80m
FLCM  30.5%  13.99k $562.50m => $548.57m
   SELL 13.99k at $38.85k/share for $543.73m; Average cost: $40.20k/share, Net $18.76m
Total: $-896.744m; Value: 891.273m; Max: 69.2%
 */