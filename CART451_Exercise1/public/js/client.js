window.onload = function(){
    console.log("Window loaded");

// GET REQUEST
document.querySelector('#findData').addEventListener('click',
    async function(){
        let lat_lng_vals = {lat_send:document.querySelector("#search_lat").value, lng_send:document.querySelector("#search_long").value};
        let response = await fetch(`http://localhost:4200/sendSearch?${new URLSearchParams(lat_lng_vals)}`);
        console.log("THE RESPONSE:");
        console.log(await response.json());
    }); 

document.querySelector("#sendData").addEventListener('click', 
    async function(event){
        event.preventDefault();
        console.log("clicked");
        let netflix_data={
            Title:document.querySelector("#feature_type").value,
            Genre:document.querySelector("#chart").value,
            Premiere: document.querySelector("#water_level").value,
            Runtime: parseFloat(document.querySelector("#lat").value),
            Language: parseFloat(document.querySelector("#lng").value)
        }; 
        // Default options are marked with *
        const response = await fetch("/postForm", {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          credentials: "same-origin", // include, *same-origin, omit
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          redirect: "follow", // manual, *follow, error
          referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: JSON.stringify(shipwreck_ ), // body data type must match "Content-Type" header
        });
      
        console.log(await response.text());
        })

    }