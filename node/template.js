
module.exports = {
    articleTemplate : function(title, titleId, url, imgUrl, title, desc, date, sampleCodeUrl, moduleCodeUrl ){
        return `
<a class="article-${titleId} article-link" href="${url}">
     <div class="article">
         <img class="article-img" src="${imgUrl}" alt="">
         <h2 class="article-title">${title}</h2>
         <div class="article-date">${date}</div>
         <p class="article-desc">${desc}</p>
         <a href="${sampleCodeUrl}" target="_blank">Sample Code</a> | <a href="${moduleCodeUrl}">Module Code</a>
     </div>
</a>
`
    },
    htmlTemplate : function(title){
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1">
    <link href='https://fonts.googleapis.com/css?family=Roboto:400,300,700' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" type="text/css" href="main.css">
</head>
<body>
<h1 class="title">${title}</h1>
<div class="description"></div>
<div class="codeUrl"><a href="" target="_blank">Sample Code</a> | <a href="">Module Code</a></div>
<script src="../dest/SanZigenGL2.js"></script>
<script id="vertexShader" type="x-shader/x-vertex">
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
</script>
<script>
</script>
</body>
</html>
`;
    }
}