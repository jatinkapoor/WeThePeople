$(document).ready(function () {

  console.log("In here");
  let officeName;
  let officialName;
  let address;
  let image;
  let party;


  const representativeAjaxCall = function () {
    let key = 'AIzaSyBM-uVbiniH-X5n5wmUhB1zJ4O9VNl57ok';
    let myUrl = 'https://www.googleapis.com/civicinfo/v2/representatives?';
    let address = '6400+Barrie+Road%2C+Minneapolis%2C+MN%2C+USA';
    let urlString = `${myUrl}key=${key}&address=${address}`

    //console.log(urlString);

    $.ajax(url = urlString, method = 'GET').then(function (response) {
      // console.log(response);

      let offices = response.offices;
      let officesSize = offices.length;
      //console.log(officesSize);
      for (let i = 0; i < officesSize; i++) {
        //console.log(offices[i]);
        let officeIndices = offices[i].officialIndices;
        let name = offices[i].name;
        // console.log(officeIndices);
        console.log(name);
        let officials = response.officials;
        for (let j = 0; j < officeIndices.length; j++) {
          console.log(officials[officeIndices[j]].name);
          console.log(officials[officeIndices[j]].party);
          console.log(officials[officeIndices[j]].phones[0]);
          console.log(officials[officeIndices[j]].photoUrl);
        }
      }

    });

  };

  representativeAjaxCall();


});