function createHandleRequest(namePage, viewPaths, ctx = null) {
  // устанавливаем путь к представлению (view) для запроса на "namePage"
  const viewPath = namePage[0].toUpperCase() + namePage.slice(1);

  viewPaths.push(`src/pages/${viewPath}`);
  app.set("views", viewPaths);
  
  // устанавливаем абсолютный путь к статике для запроса на "namePage" 
  app.use(express.static(__dirname + `/src/pages/${namePage}`))

  app.get(`/${namePage}`, (req, res) => {
    res.render(namePage, ctx);
  })
  return viewPaths;
}

// module.exports = { createHandleRequest }
