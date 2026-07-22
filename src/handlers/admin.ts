import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";
import { SEED_FABLES } from "../fables.js";
import { CATEGORIES } from "../types.js";
import type { Fable } from "../types.js";

const ADMIN_IDS = process.env.ADMIN_IDS?.split(",").map(Number) ?? [];

function isAdmin(ctx: Ctx): boolean {
  if (ADMIN_IDS.length === 0) return true;
  return ADMIN_IDS.includes(ctx.from?.id ?? 0);
}

const composer = new Composer<Ctx>();

composer.command("admin", async (ctx) => {
  if (!isAdmin(ctx)) {
    await ctx.reply("Sorry, only admins can access moderation tools.");
    return;
  }
  await showAdminMenu(ctx);
});

composer.callbackQuery("admin:menu", async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) {
    await ctx.reply("Sorry, only admins can access moderation tools.");
    return;
  }
  await showAdminMenu(ctx);
});

composer.callbackQuery("admin:flagged", async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) {
    await ctx.reply("Sorry, only admins can access moderation tools.");
    return;
  }
  const flagged = SEED_FABLES.filter((f) => f.flagged);
  if (flagged.length === 0) {
    await ctx.reply("No flagged submissions right now. All clear!", {
      reply_markup: inlineKeyboard([
        [inlineButton("⬅️ Back to admin", "admin:menu")],
        [inlineButton("⬅️ Back to menu", "menu:main")],
      ]),
    });
    return;
  }
  const rows = flagged.map((f) => [inlineButton(`${f.title} by ${f.author}`, `admin:review:${f.id}`)]);
  const keyboard = inlineKeyboard([
    ...rows,
    [inlineButton("⬅️ Back to admin", "admin:menu")],
  ]);
  await ctx.reply(`Flagged submissions (${flagged.length}):`, { reply_markup: keyboard });
});

composer.callbackQuery(/^admin:review:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) {
    await ctx.reply("Sorry, only admins can access moderation tools.");
    return;
  }
  const fableId = ctx.match[1];
  const fable = SEED_FABLES.find((f) => f.id === fableId);
  if (!fable) {
    await ctx.reply("Couldn't find that submission.", {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to admin", "admin:menu")]]),
    });
    return;
  }
  const tagLabels = fable.tags.map((t) => CATEGORIES.find((c) => c.tag === t)?.label ?? t).join(", ");
  const text = `Review: ${fable.title}\nby ${fable.author}\n\n${fable.text}\n\n—\nThemes: ${tagLabels}\nFlag: ${fable.flagReason ?? "Not specified"}`;
  const keyboard = inlineKeyboard([
    [inlineButton("✅ Approve", `admin:approve:${fableId}`), inlineButton("🗑 Remove", `admin:delete:${fableId}`)],
    [inlineButton("⬅️ Back to flagged", "admin:flagged")],
    [inlineButton("⬅️ Back to admin", "admin:menu")],
  ]);
  await ctx.reply(text, { reply_markup: keyboard });
});

composer.callbackQuery(/^admin:approve:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ text: "Approved!" });
  if (!isAdmin(ctx)) {
    await ctx.reply("Sorry, only admins can access moderation tools.");
    return;
  }
  const fableId = ctx.match[1];
  const fable = SEED_FABLES.find((f) => f.id === fableId);
  if (fable) {
    fable.flagged = false;
    fable.flagReason = undefined;
  }
  await ctx.reply(`"${fable?.title ?? "Unknown"}" has been approved and is now live in the library.`, {
    reply_markup: inlineKeyboard([
      [inlineButton("⬅️ Back to flagged", "admin:flagged")],
      [inlineButton("⬅️ Back to admin", "admin:menu")],
    ]),
  });
});

composer.callbackQuery(/^admin:delete:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) {
    await ctx.reply("Sorry, only admins can access moderation tools.");
    return;
  }
  const fableId = ctx.match[1];
  const idx = SEED_FABLES.findIndex((f) => f.id === fableId);
  if (idx >= 0) {
    SEED_FABLES.splice(idx, 1);
    await ctx.reply("Removed from the library.", {
      reply_markup: inlineKeyboard([
        [inlineButton("⬅️ Back to flagged", "admin:flagged")],
        [inlineButton("⬅️ Back to admin", "admin:menu")],
      ]),
    });
  } else {
    await ctx.reply("Couldn't find that submission.", {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to admin", "admin:menu")]]),
    });
  }
});

composer.callbackQuery("admin:stats", async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!isAdmin(ctx)) {
    await ctx.reply("Sorry, only admins can access moderation tools.");
    return;
  }
  const total = SEED_FABLES.length;
  const flagged = SEED_FABLES.filter((f) => f.flagged).length;
  const byTag = CATEGORIES.map((c) => ({
    label: c.label,
    count: SEED_FABLES.filter((f) => f.tags.includes(c.tag)).length,
  }));
  const tagSummary = byTag.map((t) => `${t.label}: ${t.count}`).join(" | ");
  await ctx.reply(`Library stats:\n\nTotal fables: ${total}\nFlagged: ${flagged}\n\nBy theme:\n${tagSummary}`, {
    reply_markup: inlineKeyboard([
      [inlineButton("⬅️ Back to admin", "admin:menu")],
      [inlineButton("⬅️ Back to menu", "menu:main")],
    ]),
  });
});

async function showAdminMenu(ctx: Ctx) {
  const flaggedCount = SEED_FABLES.filter((f) => f.flagged).length;
  const flagLabel = flaggedCount > 0 ? `🚩 Flagged (${flaggedCount})` : "🚩 Flagged";
  const keyboard = inlineKeyboard([
    [inlineButton(flagLabel, "admin:flagged")],
    [inlineButton("📊 Library stats", "admin:stats")],
    [inlineButton("⬅️ Back to menu", "menu:main")],
  ]);
  await ctx.reply("Admin tools — pick what you need:", { reply_markup: keyboard });
}

export default composer;
