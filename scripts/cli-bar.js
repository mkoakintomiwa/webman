const cliProgress = require('cli-progress');

/**
 * 
 * @param {string} title The name just before the bar 
 * @returns 
 */
function cliBar(title){
    let bar = new cliProgress.SingleBar({
        format: `${title} [{bar}] {value}% | Elapsed: {duration_formatted}`,
        autopadding: true
    }, cliProgress.Presets.shades_classic);

    bar.start(100, 0);

    return bar;
}


module.exports = cliBar;