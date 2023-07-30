/**
 * Coded with love by Failfa.st
 * LICENSE: AGPL 3.0
 * https://github.com/failfa-st/failfast-comfyui-extensions/blob/main/LICENSE
 *
 * Visit https://github.com/failfa-st/failfast-comfyui-extensions for more info
 *
 * Hopmepage:  https://failfa.st
 * GitHub: https://github.com/failfa-st
 * Discord: https://discord.com/invite/m3TBB9XEkb
 */
import { app } from "../../../scripts/app.js";

function getColor(index, lengthOfItems, l = 0.5) {
  // Normalize the index value to be between 0 and 360 for full spectrum of hue
  const hue = Math.floor((index / lengthOfItems) * 360);

  // Convert the hue to RGB using helper function
  const [r, g, b] = hslToRgb(hue / 360, 0.3, l);

  // Convert RGB to Hex
  return rgbToHex(r, g, b);
}

function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // Achromatic
  } else {
    const hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function rainbowify(app) {
  // Sort by position on canvas
  const nodes = [...app.graph._nodes].sort((a, b) => {
    if (a.pos[1] > b.pos[1]) {
      return 1;
    }
    if (a.pos[1] < b.pos[1]) {
      return -1;
    }
    return a.pos[0] - b.pos[0];
  });

  nodes.forEach((node, index) => {
    node.bgcolor = getColor(index, nodes.length, 0.3);
    node.color = getColor(index, nodes.length, 0.2);
  });
  app.graph.change();
}

function unrainbowify(app) {
  app.graph._nodes.forEach((node) => {
    node.bgcolor = node._bgcolor;
    node.color = node._color;
  });
  app.graph.change();
}

/**
 * Colors
 */

const colorsName = "Failfast.colors";

app.registerExtension({
  name: colorsName,
  async setup(app) {
    app.graph._nodes.forEach((node) => {
      // Cache the original colors
      node._bgcolor = node._bgcolor ?? node.bgcolor;
      node._color = node._color ?? node.color;
    });
    const state = JSON.parse(
      window.localStorage.getItem("Comfy.Settings.Failfast.colors") ?? "false",
    );
    if (state) {
      rainbowify(app);
    }
  },
  loadedGraphNode(node, app) {
    // Cache the original colors
    node._bgcolor = node._bgcolor ?? node.bgcolor;
    node._color = node._color ?? node.color;
    const state = JSON.parse(
      window.localStorage.getItem("Comfy.Settings.Failfast.colors") ?? "false",
    );
    if (state) {
      rainbowify(app);
    }
  },
  async init(app) {
    const afterChange = app.graph.afterChange;

    app.ui.settings.addSetting({
      id: colorsName,
      name: "Rainbow nodes",
      type: "boolean",
      tooltip: "Always color nodes in  rainbow colors.",
      defaultValue: false,
      onChange(value) {
        // If checked, modify the afterChange
        // Otherwise revert
        if (value) {
          app.graph.afterChange = () => {
            rainbowify(app);
          };
          rainbowify(app);
        } else {
          app.graph.afterChange = afterChange;
          unrainbowify(app);
        }
      },
    });
  },
});