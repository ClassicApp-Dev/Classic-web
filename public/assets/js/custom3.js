function updateprofile (){
    $("#profileform").submit();
}

function setCover(path){
    //$('#coverP').css('background-image','http://50.18.102.80'+path);
    console.log(path)
    document.getElementsByClassName('cover-img')[0].style.backgroundImage = "url('http://50.18.102.80"+path.trim()+"')";

}



// const onChange = (e) => {
//     let url = "https://<server-url>/api/upload";
//     let file = e.target.files[0];
//     uploadFile(url, file);
//   };