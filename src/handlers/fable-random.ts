import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";
import { SEED_FABLES } from "../fables.js";
import { CATEGORIES } from "../types.js";

registerMainMenuItem({ label: "🎲 Random fable", data: "fable:random", order: 20 });

const composer = new Composer<Ctx>();

composer.callbackQuery("fable:random", async (ctx) => {
  await ctx.answerCallbackQuery();
  const fable = SEED_FABLES[Math.floor(Math.random() * SEED_FABLES.length)];
  const tagLabels = fable.tags.map((t) => CATEGORIES.find((c) => c.tag === t)?.label ?? t).join(", ");
  const text = `${fable.title}\nby ${fable.author}\n\n${fable.text}\n\n—\nLength: ${fable.length} | Ages: ${fable.ageSuitability} | Themes: ${tagLabels}`;
  const keyboard = inlineKeyboard([
    [inlineButton("🎲 Another random fable", "fable:random")],
    [inlineButton("⬅️ Back to menu", "menu:main")],
  ]);
  await ctx.reply(text, { reply_markup: keyboard });
});

export default composer;
