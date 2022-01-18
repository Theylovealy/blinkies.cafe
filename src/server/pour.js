/* eslint no-control-regex: "off", no-unused-vars: ["error", { "varsIgnorePattern": "stdout*" }] */
const fs = require("fs");
const util = require('util');
const data = require('./data.js')
const execFile = util.promisify(require('child_process').execFile);

const siteURL = global.prod ? 'https://blinkies.cafe' : 'http://localhost:8080';

function addSlashes(str) {
    return (str + '').replace(/[^a-zA-Z0-9-_'!.? ]/g, '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random()*charactersLength));
    }
    return result;
}

function timeStart (label, timeflag) {
    if (timeflag) { console.time(label); }
}

function timeEnd (label, timeflag) {
    if (timeflag) { console.timeEnd(label); }
}

async function genBlinkie(instyle, intext, time) {
    let blinkieLink = ''

    try {
        const styleNumber = parseInt(instyle);
        if (styleNumber in data.styleProps) {
            timeStart('  generating blinkie', time);
            const id = data.styleProps[styleNumber].id
            const colour1 = data.styleProps[styleNumber].colour1;
            const colour2 = data.styleProps[styleNumber].colour2;
            const font = data.styleProps[styleNumber].font;
            const fontsize = data.styleProps[styleNumber].fontsize;
            const x = data.styleProps[styleNumber].x;
            const y = data.styleProps[styleNumber].y;

            let cleantext = addSlashes(intext);
            if (cleantext.replace(/\s/g, '').length == 0) {
                cleantext = addSlashes(data.styleProps[styleNumber].name);
            }

            const blinkieID = makeid(2);
            blinkieLink = siteURL + '/b/blinkiesCafe-' + blinkieID + '.gif';

            const args1 =
                ['-pointsize',fontsize,
                 '+antialias',
                 '-page','+'+x+'+'+y,
                 '-gravity','Center',
                 '-family',font,
                 '-fill',colour1,
                 '-draw',"text 0,0 '" + cleantext + "'",
                 global.appRoot + '/assets/blinkies-bg/png/' + id + '-1.png',
                 global.appRoot + '/assets/blinkies-frames/' + blinkieID + '-1.png'
                ]
            const args2 =[
                '-pointsize',fontsize,
                '+antialias',
                '-page','+'+x+'+'+y,
                '-gravity','Center',
                '-family',font,
                '-fill',colour2,
                '-draw',"text 0,0 '" + cleantext + "'",
                global.appRoot + '/assets/blinkies-bg/png/' + id + '-2.png',
                global.appRoot + '/assets/blinkies-frames/' + blinkieID + '-2.png'
            ]
            const args3 = [
                '-page','+0+0',
                '-delay','10',
                '-loop','0',
                global.appRoot + '/assets/blinkies-frames/' + blinkieID + '*',
                global.appRoot + '/assets/blinkies-public/blinkiesCafe-' + blinkieID + '.gif'
            ]

            const stdout1 = execFile('convert', args1);
            const stdout2 = execFile('convert', args2);

            await Promise.all([stdout1, stdout2]).then(async function() {
                const { stdout3, stderr3 } = await execFile('convert', args3);
                if (stderr3) { return }
                timeEnd('  generating blinkie', time);
            });
            fs.unlink(global.appRoot + '/assets/blinkies-frames/' + blinkieID + '-1.png', function(err) {
                if (err) { return }
            });
            fs.unlink(global.appRoot + '/assets/blinkies-frames/' + blinkieID + '-2.png', function(err) {
                if (err) { return }
            });
        }  // end if (styleNumber in styleProps)

        else {
            blinkieLink = siteURL + '/b/display/blinkiesCafe.gif';
        }  // end else (styleNumber not in styleProps)

    }  // end try

    catch (err) {
        blinkieLink = siteURL + '/b/display/blinkiesCafe.gif';
    }

    return blinkieLink;
}

module.exports = {
    genBlinkie
}