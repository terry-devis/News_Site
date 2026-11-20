import { NextResponse } from "next/server";
import {
  getWidgetsData,
  updatePrayerSettings,
  savePrayerDayOverride,
  resetPrayerDayOverride,
  updateCurrencyRates,
  updateGoldSettings,
  updateWeatherSettings,
  fetchLiveServiceData,
} from "@/lib/cmsDb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || "Karachi";
    const data = await getWidgetsData(city);
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("Widgets GET error:", error);
    return NextResponse.json({ error: "Failed to fetch widgets data" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "prayer_settings") {
      const updated = await updatePrayerSettings(body.settings);
      return NextResponse.json({ success: true, prayer: updated });
    }

    if (action === "prayer_override") {
      const { city, date, data } = body;
      const saved = await savePrayerDayOverride(city, date, data);
      return NextResponse.json({ success: true, override: saved });
    }

    if (action === "prayer_reset") {
      const { city, date } = body;
      await resetPrayerDayOverride(city, date);
      return NextResponse.json({ success: true });
    }

    if (action === "currency") {
      const { rates, mode, showOnWebsite } = body;
      const updated = await updateCurrencyRates(rates, mode, showOnWebsite);
      return NextResponse.json({ success: true, currency: updated });
    }

    if (action === "gold") {
      const updated = await updateGoldSettings(body.gold);
      return NextResponse.json({ success: true, gold: updated });
    }

    if (action === "weather") {
      const { cities, mode, showOnWebsite } = body;
      const updated = await updateWeatherSettings(cities, mode, showOnWebsite);
      return NextResponse.json({ success: true, weather: updated });
    }

    if (action === "fetch_live") {
      const { serviceType } = body;
      const updated = await fetchLiveServiceData(serviceType);
      return NextResponse.json({ success: true, widgets: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Widgets POST error:", error);
    return NextResponse.json({ error: "Failed to update widgets" }, { status: 500 });
  }
}
