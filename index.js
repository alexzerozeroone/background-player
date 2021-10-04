const { Plugin } = require("powercord/entities");

var playing = [];
var loop = false;

const prefix = "bg";
const commands = ["pause", "play", "src", "loop", "pause", "vol"];

function p(s) { return prefix + s }

function n(s) {
    powercord.api.notices.sendToast("notif", {
        header: "background-player",
        content: s,
        timeout: 3e3,
    });
}

module.exports = class AlexsBadPlugin extends Plugin {
    async startPlugin() {
        powercord.api.commands.registerCommand({
            command: p("play"),
            description: "Play file in background by link.",
            usage: "{c} <file>",
            executor: (args) => {
                if (args.length > 0) {
                    var audio = new Audio(args[0]);
                    audio.volume = 0.5;

                    if (loop) {
                        audio.loop = true;
                    }

                    playing = audio;
                    playing.play();

                    var filename = playing.src.split("/").pop().split("#")[0].split("?")[0];
                    n("Playing " + filename + " at volume " + audio.volume);
                } else {
                    if (typeof playing == "object") {
                        playing.play();
                        var filename = playing.src.split("/").pop().split("#")[0].split("?")[0];
                        n("Played " + filename);
                    }

                    n("No file currently playing.");
                }
            }
        });

        powercord.api.commands.registerCommand({
            command: p("pause"),
            description: "Pause current file playing.",
            usage: "{c}",
            executor: (args) => {
                playing.paused ? playing.play() : playing.pause();
                n(playing.paused ? "Paused file." : "Resumed file.")
            }
        });

        powercord.api.commands.registerCommand({
            command: p("loop"),
            description: "Loop current file playing.",
            usage: "{c}",
            executor: (args) => {
                var oldplaying = playing;
                loop = !playing.loop
                playing.loop = loop;

                n(oldplaying.loop ? "Looping file." : "Stopped looping file.");
            }
        });

        powercord.api.commands.registerCommand({
            command: p("src"),
            description: "Print current source link",
            usage: "{c}",
            executor: (args) => {
                return {
                    send: false,
                    result: playing.src
                }
            }
        });

        powercord.api.commands.registerCommand({
            command: p("vol"),
            description: "Set volume of current file playing.",
            usage: "{c} [volume]",
            executor: (args) => {
                if (Number(args[0])) {
                    playing.volume = args[0];
                    n("Set volume to " + playing.volume);
                } else {
                    n("Volume: " + playing.volume);
                }
            }
        });

        powercord.api.commands.registerCommand({
            command: p("elapsed"),
            description: "Print elapsed time of current file playing.",
            usage: "{c}",
            executor: (args) => {
                n("Elapsed time: " + Math.floor(playing.currentTime) + "s");
            }
        });
    }

    pluginWillUnload() {
        for (var i = 0; i < commands.length; i++) {
            powercord.api.commands.unregisterCommand(commands[i]);
        }
    }
};