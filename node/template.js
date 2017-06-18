
module.exports = {
    articleTemplate : function(title, titleId, url, imgUrl, title, desc, date, sampleCodeUrl, moduleCodeUrl ){
        return `
<div class="article-${titleId} article-wrapper">
     <div class="article">
         <a href="${url}"><img class="article-img" src="${imgUrl}" alt=""></a>
         <a href="${url}"><h2 class="article-title">${title}</h2></a>
         <div class="article-date">${date}</div>
         <p class="article-desc">${desc}</p>
         <p class="article-codes">
            <a class="sampleCodeUrl" href="${sampleCodeUrl}" target="_blank">Sample Code</a> <span> | </span> <a class="moduleCodeUrl" href="${moduleCodeUrl}">Module Code</a>
         </p>
     </div>
</div>
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
<div class="content">
    <h1 class="title">${title}</h1>
    <div class="description"></div>
    <div class="codeUrl"><a href="" target="_blank">Sample Code</a> | <a href="">Module Code</a></div>
</div>
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