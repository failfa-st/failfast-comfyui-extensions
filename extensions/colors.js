/**
 * Coded with love by Failfa.st
 * LICENSE: AGPL 3.0
 * https://github.com/failfa-st/failfast-comfyui-extensions/blob/main/LICENSE
 *
 * Visit https://github.com/failfa-st/failfast-comfyui-extensions for more info
 *
 * Homepage:  https://failfa.st
 * GitHub: https://github.com/failfa-st
 * Discord: https://discord.com/invite/m3TBB9XEkb
 */
import { app } from "/scripts/app.js";
import { $el } from "/scripts/ui.js";

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
function hslToHex(h, s, l) {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function shadeHexColor(hex, amount = -0.2) {
  // Remove the # symbol if it exists
  if (hex.startsWith("#")) {
    hex = hex.slice(1);
  }

  // Convert the hex values to decimal (base 10) integers
  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);

  // Apply the shade amount to each RGB component
  r = Math.max(0, Math.min(255, r + amount * 100));
  g = Math.max(0, Math.min(255, g + amount * 100));
  b = Math.max(0, Math.min(255, b + amount * 100));

  // Convert the updated RGB values back to HEX
  return rgbToHex(r, g, b);
}

function getContrastColor(hexColor) {
  // Remove the # symbol if it exists
  if (hexColor.startsWith("#")) {
    hexColor = hexColor.slice(1);
  }

  // Convert the hex values to decimal (base 10) integers
  const r = parseInt(hexColor.slice(0, 2), 16) / 255;
  const g = parseInt(hexColor.slice(2, 4), 16) / 255;
  const b = parseInt(hexColor.slice(4, 6), 16) / 255;

  // Calculate the relative luminance
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Use the contrast ratio to determine the text color
  return L > 0.179 ? "#000000" : "#FFFFFF";
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
    node.color = shadeHexColor(node.bgcolor);
    node.setDirtyCanvas(true, true);
  });
  // app.graph.change();
}

function uncolor(app) {
  app.graph._nodes.forEach((node) => {
    if (node.type.toLowerCase() === "note") {
      const [h, s, l] = colors.note;
      const bgcolor = hslToHex(h / 360, s, l);
      node.bgcolor = bgcolor;
      node.color = shadeHexColor(node.bgcolor);
    } else {
      node.bgcolor = hslToHex(0, 0, 0.3);
      node.color = shadeHexColor(node.bgcolor);
    }
    node.setDirtyCanvas(true, true);
  });
}

const colors = {
  loader: [0, 0.4, 0.3],
  clip: [20, 0.4, 0.3],
  note: [40, 0.4, 0.3],
  sampler: [60, 0.4, 0.3],
  controlnet: [80, 0.4, 0.3],
  vae: [100, 0.4, 0.3],
  conditioning: [120, 0.4, 0.3],
  latent: [140, 0.4, 0.3],
  mask: [160, 0.4, 0.3],
  image: [180, 0.4, 0.3],
  style: [200, 0.4, 0.3],
  primitive: [220, 0.4, 0.3],
  gligen: [240, 0.4, 0.3],
};

function colorNode(node) {
  const colorRef = Object.entries(colors).find(([key]) => {
    return node.type.toLowerCase().includes(key);
  });
  if (colorRef) {
    const [h, s, l] = colorRef[1];
    const bgcolor = hslToHex(h / 360, s, l);
    node.bgcolor = bgcolor;
    node.color = shadeHexColor(node.bgcolor);
  }
}
function colorByType(app) {
  app.graph._nodes.forEach((node) => {
    colorNode(node);
    node.setDirtyCanvas(true, true);
  });
}

function colorPositiveNegative(app) {
  app.graph._nodes.forEach((node) => {
    // const onPropertyChanged = node.onPropertyChanged;
    // node.onPropertyChanged = function () {};
    if (node.title.toLowerCase().includes("positive")) {
      const bgcolor = hslToHex(120 / 360, 0.4, 0.3);
      node.bgcolor = bgcolor;
      node.color = shadeHexColor(node.bgcolor);
    } else if (node.title.toLowerCase().includes("negative")) {
      const bgcolor = hslToHex(0, 0.4, 0.3);
      node.bgcolor = bgcolor;
      node.color = shadeHexColor(node.bgcolor);
    }
    node.setDirtyCanvas(true, true);
  });
}

/**
 * Colors
 */
let afterChange;
let colorModeValue;
function invokeAfterChange() {
  switch (colorModeValue) {
    case 1:
      uncolor(app);
      break;
    case 2:
      rainbowify(app);
      break;
    case 3:
      colorByType(app);
      break;
    default:
      break;
  }
  if (getPosNegValue()) {
    colorPositiveNegative(app);
  }
  return afterChange?.apply(this, arguments);
}

function setColorMode(value, app) {
  colorModeValue = value;
  switch (value) {
    case 1:
      uncolor(app);
      break;
    case 2:
      rainbowify(app);
      break;
    case 3:
      colorByType(app);
      break;
    default:
      app.graph._nodes.forEach((node) => {
        node.bgcolor = node._bgcolor ?? node.bgcolor;
        node.color = node._color ?? node.color;
        node.setDirtyCanvas(true, true);
      });
      break;
  }
  if (getPosNegValue()) {
    colorPositiveNegative(app);
  }
}

const colorModes = ["default", "plain", "rainbow", "type"];
const colorsName = "Failfast.colors";

function getPosNegValue() {
  return (
    window.localStorage.getItem(`Comfy.Settings.${colorsName}-posneg`) ===
    "true"
  );
}

let loading = false;
app.registerExtension({
  name: colorsName,
  async setup(app) {
    const value = +(
      window.localStorage.getItem(`Comfy.Settings.${colorsName}`) ?? "0"
    );
    app.graph._nodes.forEach((node) => {
      node._bgcolor = node._bgcolor ?? node.bgcolor;
      node._color = node._color ?? node.color;
    });
    setColorMode(value, app);
  },
  loadedGraphNode(node, app) {
    node._bgcolor = node._bgcolor ?? node.bgcolor;
    node._color = node._color ?? node.color;
    if (!loading) {
      loading = true;
      setTimeout(function () {
        loading = false;

        const value = +(
          window.localStorage.getItem(`Comfy.Settings.${colorsName}`) ?? "0"
        );
        setColorMode(value, app);
      }, 500);
    }
  },
  async init(app) {
    afterChange = app.graph.afterChange;
    app.graph.afterChange = invokeAfterChange;
    const onMenuNodeColors = LGraphCanvas.onMenuNodeColors;
    LGraphCanvas.onMenuNodeColors = function (value, options, e, menu, node) {
      const response = onMenuNodeColors.apply(this, arguments);
      const menuRoot = menu.current_submenu.root;
      const isGroup = node instanceof LGraphGroup;

      menuRoot.append(
        $el("div.litemenu-entry.submenu", [
          $el(
            "label",
            {
              style: {
                position: "relative",
                overflow: "hidden",
                display: "block",
                paddingLeft: "4px",
                borderLeft: "8px solid #222",
              },
            },
            [
              "Custom",
              $el("input", {
                type: "color",
                value: node.bgcolor,
                style: {
                  position: "absolute",
                  right: "200%",
                },
                oninput(event) {
                  node.bgcolor = event.target.value;
                  node.color = shadeHexColor(node.bgcolor);
                  // TODO: check if we can adjust this
                  // node.title_color = getContrastColor(node.bgcolor);

                  node.setDirtyCanvas(true, true);
                },
              }),
            ],
          ),
        ]),
      );
      if (isGroup) {
        menuRoot.append(
          $el("div.litemenu-entry.submenu", [
            $el(
              "label",
              {
                style: {
                  position: "relative",
                  overflow: "hidden",
                  display: "block",
                  paddingLeft: "4px",
                  borderLeft: "8px solid #222",
                },
              },
              [
                "Color all",
                $el("input", {
                  type: "color",
                  value: node.bgcolor,
                  style: {
                    position: "absolute",
                    right: "200%",
                  },
                  oninput(event) {
                    node.recomputeInsideNodes();
                    node.bgcolor = event.target.value;
                    node.color = shadeHexColor(node.bgcolor);
                    node._nodes.forEach((node_) => {
                      node_.bgcolor = node.bgcolor;
                      node_.color = node.color;
                    });
                    // TODO: check if we can adjust this
                    // node.title_color = getContrastColor(node.bgcolor);

                    node.setDirtyCanvas(true, true);
                  },
                }),
              ],
            ),
          ]),
        );
      }
      return response;
    };
    app.ui.settings.addSetting({
      id: colorsName,
      name: "Color Mode",
      type(name, setter, value) {
        return $el("tr", [
          $el("td", [
            $el("label", {
              for: colorsName.replaceAll(".", "-"),
              textContent: "Color Mode",
            }),
          ]),

          $el("td", [
            $el(
              "select",
              {
                id: colorsName.replaceAll(".", "-"),
                onchange: (event) => {
                  setter(+event.target.value);
                },
              },
              colorModes.map((mode, index) => {
                return $el("option", {
                  textContent: mode,
                  value: index,
                  selected: index === +value,
                });
              }),
            ),
            $el(
              "label",
              { style: { display: "block", paddingTop: "0.5rem" } },
              [
                $el("span", { style: { paddingRight: "0.5rem" } }, [
                  "Positive / Negative",
                ]),
                $el("input", {
                  type: "checkbox",
                  checked:
                    window.localStorage.getItem(
                      `Comfy.Settings.${colorsName}-posneg`,
                    ) === "true",
                  onchange: (event) => {
                    window.localStorage.setItem(
                      `Comfy.Settings.${colorsName}-posneg`,
                      event.target.checked.toString(),
                    );
                    if (event.target.checked) {
                      colorPositiveNegative(app);
                    }
                  },
                }),
              ],
            ),
          ]),
        ]);
      },
      tooltip:
        "Automatic color modes for nodes. (positive / negative will respect those words in the title )",
      defaultValue: 2,
      onChange(value) {
        setColorMode(value, app);
      },
    });
  },
});
