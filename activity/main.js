let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path");
const { create } = require("domain");
let arr = [];
//let PDFDocument = require("pdfkit");
//const { createDecipher } = require("crypto");
//const { write } = require("pdfkit/js/data");
let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";
let maindir ="IPL_2020";
createDir(maindir);
request(url, cb)
function cb(error, response, html){
    if(error){
        console.log(error);
    }else{
        extractnameandlink(html);
    }
}
function createDir(topicname){
    let pathoftopic = path.join(__dirname, topicname);
    if(fs.existsSync(pathoftopic)==false){
        fs.mkdirSync(pathoftopic);
    }
}
function createsubdir(topicname, maindir){
    let pathoftopic = path.join(__dirname, maindir, topicname);
    if(fs.existsSync(pathoftopic)==false){
        fs.mkdirSync(pathoftopic);
    }

}

function extractnameandlink(html){

    let seltool = cheerio.load(html);
    let link = url + "/match-results";
    getname(link);
    /*let rowsoftopics = seltool(".table-responsive tbody tr");
    for(let i = 0; i<rowsoftopics.length; i++)
    {
        let name = seltool(rowsoftopics[i]).find("a").text();
        //let link = "https://github.com" + seltool(blocksoftopics[i]).find("a.").attr("href");
        createsubdir(name, maindir);
           
    }*/
}
function getname(link){
    request(link, cb);
    function cb(err, response, html)
    {
        if(err)
        {
            console.log(err);
        }else{
            getnamelink(html);
        }
    }

}
let date=[];
let venue=[];
let result=[];
let opponent_name=[];
function getnamelink(html){
    let seltool = cheerio.load(html);
    let matchCard = seltool(".col-md-8.col-16")
    //console.log(matchCard.length);
    for(let i = 0; i<matchCard.length; i++)
    {
        let extradetail = seltool(matchCard[i]).find("div.match-score-block div.description").text();
        
        let extras = extradetail.split(",");
        let dates = extras[8];
        let venues = extras[7];
        let results = seltool(matchCard[i]).find("div.status-text span").text();
        let opponent_names = seltool(matchCard[i]).find(".team.team-gray .name-detail").text();
        //console.log(opponent_names);
        date.push(dates);
        venue.push(venues);
        result.push(results);
        opponent_name.push(opponent_names);
        //console.log(result);
        //console.log(date, venue);
        let scorCardbttns = seltool(matchCard[i]).find(".btn.btn-sm.btn-outline-dark.match-cta");
        let linksofmatch = seltool(scorCardbttns[2]).attr("href");
        let fulllink = "https://www.espncricinfo.com"+linksofmatch;
        gettoscorecard(fulllink);
    }
}
function gettoscorecard(fulllink){
    request(fulllink, cb);
    function cb(err, resp, html)
    {
        if(err)
        {
            console.log(err);
        }else{
            getdetaillink(html);
        } 
    }
}
function getdetaillink(html){
    let seltool = cheerio.load(html);
    let teameleArr = seltool(".Collapsible h5.header-title.label")
    let batsmantables = seltool(".table.batsman");
   // console.log(batsmantables.html());
    let teamarr = [];
    for(let i = 0; i<teameleArr.length; i++)
    {
        let teamstr = seltool(teameleArr[i]).text();
        let teamname = teamstr.split("INNINGS")[0];
        teamarr.push(teamname);
        createsubdir(teamname, maindir);
        
        
    }
    let batsmanarr = [];
    for(let i = 0; i<batsmantables.length; i++){

    
        let batsmanele = seltool(batsmantables[i]).find("tbody tr .batsman-cell");
        for(let j = 0; j<batsmanele.length; j++)
        {
            let batsmanName = seltool(batsmanele[j]).text().trim();
            
            //console.log(batsmanName);
            batsmanarr.push(batsmanName);
            createfilename(batsmanName, teamarr[i]);
            
        }
    }
    
    
    for(let i = 0; i<batsmantables.length; i++)
    {
        let singlebatsmantable = seltool(batsmantables[i]).find("tbody tr");
        for(let j = 0; j<singlebatsmantable.length; j++)
        {
            let eachstat = seltool(singlebatsmantable[j]).find("td");
            let R = seltool(singlebatsmantable[j]).find("td.font-weight-bold").text();
            let B = seltool(eachstat[3]).text();

            let fours = seltool(eachstat[5]).text();
            let sixes =seltool(eachstat[6]).text();
            let SR = seltool(eachstat[7]).text();
            arr.push({
                "Run":R,
                "balls":B,
                "fours":fours,
                "sixes":sixes,
                "SR":SR,
                "date":date[i],
                "venue":venue[i],
                "result":result[i],
                "opponent_name":opponent_name[i]


            })
            let filepath = path.join(__dirname, maindir, teamarr[i], batsmanarr[i] + ".json");
            
            
            fs.writeFileSync(filepath, JSON.stringify(arr));
            //console.table(arr);
        
        }
        let batsmanele = seltool(batsmantables[i]).find("tbody tr .batsman-cell");
        for(let j = 0; j<batsmanele.length; j++)
        {
            let batsmanName = seltool(batsmanele[j]).text().trim();
            
            //console.log(batsmanName);
            let teamname = teamarr[i];
            createfilename(batsmanName, teamarr[i]);
            
        }
        
}

function createfilename(batsmanName, teamname){
    let pathoffile = path.join(__dirname, maindir, teamname, batsmanName + ".json");
    if(fs.existsSync(pathoffile)==false){
        let createstream = fs.createWriteStream(pathoffile);
        createstream.end();
    }
}

/*function getLinks(link, name)
{
    request(link, cb);
    function cb(err, response, html)
    {
        if(err)
        {
            console.log(err);
        }else{
            getissuelink(html, name);
        }
    }
}
function getissuelink(html, name){
    let seltoools = cheerio.load(html);
    let topicnamele = seltoools(".h1-mktg");
    let repoLinks =seltoools("a.text-bold");
    let topicname = topicnamele.text().trim();
    console.log(topicname);
    createDir(topicname);
    
    for(let i = 0; i<8; i++)
    {
        
        let repopageLink = seltoools(repoLinks[i]).attr("href");
        //let oolink = olink + "/issues";
        let reponame = repopageLink.split("/").pop();
        reponame = reponame.trim();
        //console.log("->"+reponame);
        //createfilename(reponame, topicname);
        let oolink = "https://github.com" + repopageLink + "/issues";
        getissue(reponame, topicname, oolink);
        

    }

}

function createDir(topicname){
    let pathoftopic = path.join(__dirname, topicname);
    if(fs.existsSync(pathoftopic)==false){
        fs.mkdirSync(pathoftopic);
    }
}
function createfilename(reponame, topicname){
    let pathoffile = path.join(__dirname, topicname, reponame + ".json");
    if(fs.existsSync(pathoffile)==false){
        let createstream = fs.createWriteStream(pathoffile);
        createstream.end();
    }
}
function getissue(reponame, topicname, oolink){
    request(oolink, cb);
    function cb(error, reponse, html){
        if(error){
            if(response.statuscode == 404){
                console.log("No issue page found");
            }else{
            console.log(error);
            }
        }else{
            extractissue(html, topicname, reponame);
        }
    }
}
function extractissue(html, topicname, reponame){
    let seltool = cheerio.load(html);
    
    let IssueAnchorarr = seltool("a.Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title");
    let arr = [];
    for(let i = 0; i<IssueAnchorarr.length; i++)
    {
        let name = seltool(IssueAnchorarr[i]).text();
        let link = seltool(IssueAnchorarr[i]).attr("href");
        arr.push({
            "name" :name, 
            "link" :"https://github.com" + link
        })

    }
    let filepath = path.join(__dirname, topicname, reponame + ".pdf");
    let pdfDoc = new PDFDocument;
    pdfDoc.pipe(fs.createWriteStream(filepath));
    pdfDoc.text(JSON.stringify(arr));
    pdfDoc.end();
    /*fs.writeFileSync(filepath, JSON.stringify(arr));
    file write
    console.table(arr);*/
    

}