document.addEventListener("DOMContentLoaded", () => {
  const chart = document.getElementById("engineerEnergyChart");
  const zoneSelect = document.getElementById("monitorZoneSelect");
  if (!chart) return;

  const profiles = {
    building: [34, 30, 29, 28, 29, 36, 48, 57, 63, 69, 76, 72, 66, 64, 70, 78, 82, 74, 65, 57, 51, 46, 41, 37],
    floor5: [24, 21, 19, 18, 20, 26, 39, 54, 64, 71, 73, 67, 59, 61, 70, 76, 72, 61, 49, 39, 32, 28, 26, 24],
    floor12: [68, 67, 66, 65, 66, 68, 70, 75, 78, 82, 85, 83, 80, 81, 86, 91, 94, 89, 84, 80, 76, 73, 71, 69]
  };

  function render() {
    const values = profiles[zoneSelect ? zoneSelect.value : "building"] || profiles.building;
    const maximum = Math.max(...values);
    chart.replaceChildren();
    values.forEach((value, index) => {
      const bar = document.createElement("div");
      bar.className = `engineer-energy-bar${value === maximum ? " is-peak" : ""}`;
      bar.style.height = `${(value / maximum) * 100}%`;
      bar.title = `${String(index).padStart(2, "0")}:00 ┬╖ ${Math.round(value * 5.2)} kW`;
      bar.setAttribute("aria-hidden", "true");
      chart.append(bar);
    });
  }

  if (zoneSelect) zoneSelect.addEventListener("change", render);
  render();
});
