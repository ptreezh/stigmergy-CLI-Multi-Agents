const { runLayers } = require("../../../src/agent-forensics/detect");

describe("runLayers", () => {
  test("returns merged agents map and layer stats for all layers when layerIds is null", async () => {
    const { merged, layerStats } = await runLayers(null);
    expect(merged).toBeInstanceOf(Map);
    expect(layerStats).toBeDefined();
    expect(Object.keys(layerStats).length).toBeGreaterThan(0);
  });

  test("returns merged agents map and layer stats for selected layers", async () => {
    const { merged, layerStats } = await runLayers(["shortcut", "registry"]);
    expect(layerStats["shortcut"]).toBeDefined();
    expect(layerStats["registry"]).toBeDefined();
    expect(layerStats["appdata"]).toBeUndefined();
  });
});
