================
修改圖檔內容：
================
修改：
bg.jpg                     整個頁面的底圖
top_bg_blank.jpg           原本頁面中間的底圖，但這個不用也也沒關係，
                           從CSS裡面它拿掉即可，因為整個整個頁面的底圖(bg.jpg)已經調成一樣了

新增：
facebook_thumbimage.png    轉貼到FB時候的thumb圖示
all_heroes.png             用來替代火箭的
footer_bg.jpg              頁面底部用到的圖案，原圖是footer_bg.png，但壓縮緣故改成.jpg

================
CSS修改：
================
# main.css
div.footer-content-holder
{
    ....
    background-image: url(../images/footer_bg.png);
    ....
}
改成
div.footer-content-holder
{
    ....
    background-image: url(../images/footer_bg.jpg);
    ....
}

另外，
img.floating-rocket
{
    position: absolute;
    margin-left: 515px;
    margin-top: -100px;
}

這邊的margin-left跟margin-top也需要調整一下位置
