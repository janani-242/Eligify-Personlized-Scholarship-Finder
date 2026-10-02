// =====================================
// ELIGIFY ONBOARDING JS
// =====================================


const slides = document.querySelectorAll(".slide");

const dots = document.querySelectorAll(".dot");

const nextBtn = document.getElementById("nextBtn");

const skipBtn = document.getElementById("skipBtn");

const progressText = document.getElementById("progressText");



let currentSlide = 0;





// SHOW SLIDE FUNCTION

function showSlide(index){


    slides.forEach((slide)=>{

        slide.classList.remove("active");

    });



    dots.forEach((dot)=>{

        dot.classList.remove("active");

    });



    slides[index].classList.add("active");

    dots[index].classList.add("active");


    progressText.innerHTML =
    `${index + 1} / ${slides.length}`;



}






// NEXT BUTTON


nextBtn.addEventListener("click",function(){



    if(currentSlide < slides.length - 1){


        currentSlide++;


        showSlide(currentSlide);



        // LAST SLIDE

        if(currentSlide === slides.length - 1){


            nextBtn.innerHTML = `

            <span>
            Get Started
            </span>

            <i class="ri-login-box-line"></i>

            `;


        }



    }

    else{


        // GET STARTED CLICK


        let user =
        localStorage.getItem("eligifyUser");



        if(user === "true"){


            window.location.href="dashboard.html";


        }

        else{


            window.location.href="home.html";


        }



    }



});









// SKIP BUTTON


skipBtn.addEventListener("click",function(){



    let user =
    localStorage.getItem("eligifyUser");



    if(user === "true"){


        window.location.href="dashboard.html";


    }

    else{


        window.location.href="home.html";


    }



});