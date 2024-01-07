const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("https://www.rareskills.io/blog");

  let lastScrollHeight = 0;
  let currentScrollHeight = await page.evaluate(
    () => document.body.scrollHeight
  );

  while (lastScrollHeight < currentScrollHeight) {
    lastScrollHeight = currentScrollHeight;
    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
    await page.waitForTimeout(4000);
    currentScrollHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log("Scroll height:", currentScrollHeight);
  }

  const posts = await page.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll('[data-hook="post-list-item"]')
    );
    return items.map((item) => {
      const titleElement = item.querySelector('[data-hook="post-title"] p');
      const descriptionElement = item.querySelector(
        '[data-hook="post-description"] div div'
      );

      const linkElement = item.querySelector("a");
      return {
        title: titleElement?.innerText,
        link: linkElement?.href,
        description: descriptionElement?.innerText,
      };
    });
  });

  posts.reverse();

  let readmeContent = `# Rareskills Blog Posts Index\n\n`;
  posts.forEach((post) => {
    readmeContent += `## ${post.title} [🔗](${post.link})\n`;
    readmeContent += `${post.description}\n\n`;
  });

  fs.writeFileSync("README.md", readmeContent);

  console.log("README created.");

  await browser.close();
})();
