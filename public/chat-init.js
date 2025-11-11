window.addEventListener("keydown", (e) => {
  if (
    (e.ctrlKey || e.metaKey) &&
    ["p", "s", "w"].includes(e.key.toLowerCase())
  ) {
    e.preventDefault();
  }
});
