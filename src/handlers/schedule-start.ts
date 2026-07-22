import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";
import { CATEGORIES } from "../types.js";

registerMainMenuItem({ label: "🔔 Subscribe", data: "schedule:start", order: 30 });

const TIME_OPTIONS = ["08:00", "12:00", "17:00", "20:00"];

const composer = new Composer<Ctx>();

composer.callbackQuery("schedule:start", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = "schedule_cadence";
  const keyboard = inlineKeyboard([
    [inlineButton("📅 Daily", "schedule:cadence:daily"), inlineButton("📆 Weekly", "schedule:cadence:weekly")],
    [inlineButton("⬅️ Back to menu", "menu:main")],
  ]);
  await ctx.reply("How often would you like a fable delivered?", { reply_markup: keyboard });
});

composer.callbackQuery(/^schedule:cadence:(daily|weekly)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const cadence = ctx.match[1] as "daily" | "weekly";
  ctx.session.scheduleCadence = cadence;
  ctx.session.step = "schedule_time";
  const rows = TIME_OPTIONS.map((t) => [inlineButton(t, `schedule:time:${t}`)]);
  const keyboard = inlineKeyboard([
    ...rows,
    [inlineButton("⬅️ Back", "schedule:start")],
  ]);
  await ctx.reply("What time works best for you?", { reply_markup: keyboard });
});

composer.callbackQuery(/^schedule:time:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const time = ctx.match[1];
  ctx.session.scheduleTime = time;
  ctx.session.step = "schedule_tags";
  const rows = CATEGORIES.map((c) => [inlineButton(`${c.emoji} ${c.label}`, `schedule:tag:${c.tag}`)]);
  const keyboard = inlineKeyboard([
    ...rows,
    [inlineButton("No filter — show me everything", "schedule:tag:all")],
    [inlineButton("⬅️ Back", "schedule:start")],
  ]);
  await ctx.reply("Any themes you love? Pick one or skip for all.", { reply_markup: keyboard });
});

composer.callbackQuery(/^schedule:tag:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const tag = ctx.match[1];
  ctx.session.scheduleTags = tag === "all" ? [] : [tag];
  ctx.session.step = "schedule_confirm";
  const cadence = ctx.session.scheduleCadence ?? "daily";
  const time = ctx.session.scheduleTime ?? "08:00";
  const tagLabel = tag === "all" ? "All themes" : (CATEGORIES.find((c) => c.tag === tag)?.label ?? tag);
  const text = `Here's your subscription:\n\nFrequency: ${cadence}\nTime: ${time}\nThemes: ${tagLabel}\n\nReady to confirm?`;
  const keyboard = inlineKeyboard([
    [inlineButton("✅ Confirm", "schedule:confirm:yes"), inlineButton("❌ Cancel", "schedule:confirm:no")],
  ]);
  await ctx.reply(text, { reply_markup: keyboard });
});

composer.callbackQuery("schedule:confirm:yes", async (ctx) => {
  await ctx.answerCallbackQuery({ text: "Subscribed!" });
  ctx.session.step = undefined;
  const cadence = ctx.session.scheduleCadence ?? "daily";
  const time = ctx.session.scheduleTime ?? "08:00";
  await ctx.reply(`You're all set! You'll receive a ${cadence} fable at ${time}. Enjoy your stories!`, {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});

composer.callbackQuery("schedule:confirm:no", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = undefined;
  ctx.session.scheduleCadence = undefined;
  ctx.session.scheduleTime = undefined;
  ctx.session.scheduleTags = undefined;
  await ctx.reply("No worries — you can set this up anytime from the menu.", {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});

export default composer;
