
$('.addInterestBtn').click(function(){
    var id = $(this).attr('data-target')
        location.replace("/joininterest?n="+id)
});