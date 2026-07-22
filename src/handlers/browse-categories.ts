import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard, paginate } from "../toolkit/index.js";
import { SEED_FABLES } from "../fables.js";
import { CATEGORIES } from "../types.js";

registerMainMenuItem({ label: "📚 Browse", data: "browse:categories", order: 10 });

const FABLES_PER_PAGE = 6;

function fableSummary(f: (typeof SEED_FABLES)[number]): string {
  return `${f.title} — ${f.author}`;
}

const composer = new Composer<Ctx>();

composer.callbackQuery("browse:categories", async (ctx) => {
  await ctx.answerCallbackQuery();
  const rows = CATEGORIES.map((c) => [inlineButton(`${c.emoji} ${c.label}`, `browse:cat:${c.tag}`)]);
  const keyboard = inlineKeyboard([
    ...rows,
    [inlineButton("⬅️ Back to menu", "menu:main")],
  ]);
  await ctx.reply("Pick a theme to explore:", { reply_markup: keyboard });
});

composer.callbackQuery(/^browse:cat:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const tag = ctx.match[1];
  ctx.session.browseCategory = tag;
  ctx.session.browsePage = 0;
  await renderFableList(ctx, tag, 0);
});

composer.callbackQuery(/^browse:page:(\d+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const page = parseInt(ctx.match[1]);
  const tag = ctx.session.browseCategory ?? "";
  ctx.session.browsePage = page;
  await renderFableList(ctx, tag, page);
});

composer.callbackQuery(/^browse:fable:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const fableId = ctx.match[1];
  const fable = SEED_FABLES.find((f) => f.id === fableId);
  if (!fable) {
    await ctx.reply("Couldn't find that fable. It may have been removed.", {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to categories", "browse:categories")]]),
    });
    return;
  }
  ctx.session.currentFableId = fableId;
  const tagLabels = fable.tags.map((t) => CATEGORIES.find((c) => c.tag === t)?.label ?? t).join(", ");
  const text = `${fable.title}\nby ${fable.author}\n\n${fable.text}\n\n—\nLength: ${fable.length} | Ages: ${fable.ageSuitability} | Themes: ${tagLabels}`;
  const keyboard = inlineKeyboard([
    [inlineButton("💾 Save to my library", `browse:save:${fableId}`)],
    [inlineButton("⬅️ Back to list", `browse:backlist`)],
    [inlineButton("⬅️ Back to menu", "menu:main")],
  ]);
  await ctx.reply(text, { reply_markup: keyboard });
});

composer.callbackQuery(/^browse:save:(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ text: "Saved!" });
  const fableId = ctx.match[1];
  ctx.session.currentFableId = fableId;
  await ctx.reply("Added to your library! You can find it anytime.", {
    reply_markup: inlineKeyboard([
      [inlineButton("⬅️ Back to list", "browse:backlist")],
      [inlineButton("⬅️ Back to menu", "menu:main")],
    ]),
  });
});

composer.callbackQuery("browse:backlist", async (ctx) => {
  await ctx.answerCallbackQuery();
  const tag = ctx.session.browseCategory ?? "";
  const page = ctx.session.browsePage ?? 0;
  await renderFableList(ctx, tag, page);
});

async function renderFableList(ctx: Ctx, tag: string, page: number) {
  const filtered = SEED_FABLES.filter((f) => f.tags.includes(tag));
  const cat = CATEGORIES.find((c) => c.tag === tag);
  const catLabel = cat ? `${cat.emoji} ${cat.label}` : tag;

  if (filtered.length === 0) {
    await ctx.reply(`No fables in ${catLabel} yet — check back soon!`, {
      reply_markup: inlineKeyboard([
        [inlineButton("⬅️ Back to categories", "browse:categories")],
        [inlineButton("⬅️ Back to menu", "menu:main")],
      ]),
    });
    return;
  }

  const { page: actualPage, pageItems, totalPages, controls } = paginate(filtered, {
    page,
    perPage: FABLES_PER_PAGE,
    callbackPrefix: "browse:page",
  });
  ctx.session.browsePage = actualPage;

  const fableRows = pageItems.map((f) => [inlineButton(fableSummary(f), `browse:fable:${f.id}`)]);
  const allRows = [
    ...fableRows,
    ...controls.inline_keyboard,
    [inlineButton("⬅️ Back to categories", "browse:categories")],
  ];

  const header = `${catLabel} — page ${actualPage + 1} of ${totalPages}`;
  await ctx.reply(header, { reply_markup: inlineKeyboard(allRows) });
}

export default composer;
