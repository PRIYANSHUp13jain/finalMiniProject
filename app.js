// about-usreveiw-slider

let reviews=document.querySelectorAll(".review-wrapper");

let currReviews=[0,2];

let updateReviewSlider=(cards)=>{

    cards.forEach((card_index)=>{
        reviews[card_index].classList.add("active");
    })
}

setInterval(()=>{
    currReviews.forEach((card_index,i)=>{
        reviews[card_index].classList.remove("active");
        currReviews[i]=card_index>=reviews.length-1?0:card_index+1;
    }) 
    setTimeout(()=>{
        updateReviewSlider(currReviews);
    },250)
},5000)

//faqs
let faqs=[...document.querySelectorAll(".faq")];
faqs.map(faq=>{
    let ques=faq.querySelector(".question-box");
    ques.addEventListener("click",()=>{
        faq.classList.toggle('active');
    })
});



let dishSlider=document.querySelector(".dish-slide");

let rotationVal=0;
setInterval(()=>{
    rotationVal+=120;
    dishSlider.style.transform=`translateY(-50%) rotate(${rotationVal}deg)`;
},3000)

AOS.init();