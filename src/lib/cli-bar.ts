const cliProgress = require('cli-progress');

/**
 * 
 * @param {string} title The name just before the bar 
 * @returns 
 */
export default function cliBar(title: string): any{
    let bar = new cliProgress.SingleBar({
        format: `${title} [{bar}] {value}% | Elapsed: {duration_formatted}`,
        autopadding: true
    }, cliProgress.Presets.shades_classic);

    bar.start(100, 0);

    return bar;
}