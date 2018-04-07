$(document).ready(function () {

  let officeName;
  let officialName;
  let image;
  let party;
  let blankImage = "./assets/images/blank.png"

  let selected_state = '';
  let selected_county = '';
  let selected_local = '';
  let all_people = {};
  let pseudo_id = 1;


  let federal_pattern = "ocd-division/country:us";
  let state_pattern = /ocd-division\/country:us\/state:(\D{2}$)/;
  let cd_pattern = /ocd-division\/country:us\/state:(\D{2})\/cd:/;
  let sl_pattern = /ocd-division\/country:us\/state:(\D{2})\/(sldl:|sldu:)/;
  let county_pattern = /ocd-division\/country:us\/state:\D{2}\/county:\D+/;
  let local_pattern = /ocd-division\/country:us\/state:\D{2}\/place:\D+/;
  let district_pattern = /ocd-division\/country:us\/district:\D+/;


  let federal_offices = ['United States Senate', 'United States House of Representatives']
  let googleCoordinates = "https://maps.googleapis.com/maps/api/geocode/json";

  google.maps.event.addDomListener(window, 'load', function () {
    let places = new google.maps.places.Autocomplete(document.getElementById('address'));
    google.maps.event.addListener(places, 'place_changed', function () {
      let place = places.getPlace();
      let address = place.formatted_address;
      let add = encodeURIComponent(address);
      addressSearch(add);
    });
  });

  google.maps.event.addDomListener(window, 'load', function () {
    let places = new google.maps.places.Autocomplete(document.getElementById('addressEvents'));
    google.maps.event.addListener(places, 'place_changed', function () {
      let place = places.getPlace();
      let latitude = place.geometry.location.lat();
      let longitude = place.geometry.location.lng();
      searchEventsNearMe(latitude, longitude);
    });
  });

  $(document).on("click", "#search", function () {
    let address = $("#address").val().trim();
    let add = encodeURIComponent(address);
    addressSearch(add);
  });

  $(document).on("click", "#searchEvent", function () {
    let address = $("#addressEvents").val().trim();
    let add = encodeURIComponent(address);
    findCoordinates(add);
  });

  const findCoordinates = function (address) {
    key = `AIzaSyCvzo41OTxNaNCRdixEDqiqC_ENZnx4mrE`;
    url = `${googleCoordinates}?key=${key}&address=${address}`;
    $.ajax(url = url, method = 'GET').then(function (response) {
      let location = response.results[0].geometry.location;
      let latitude = location.lat;
      let longitude = location.lng;
      searchEventsNearMe(latitude, longitude);
    });
  };


  const searchEventsNearMe = function (latitude, longitude) {
    console.log(latitude, longitude);
    let url = `https://www.eventbriteapi.com/v3/events/search/`;
    let param1 = `politics`;
    let param2 = `venue`;
    let param3 = 'date'
    let param4 = "20mi"
    let token = `6KIBNWQ7Q6BCI7O4X7ESC34F3A45UVO3EPZZ2QMA7BEUBO5M2Z`;
    let eventUrl = `${url}?token=UEJIH7SJNP5SWIVJUDC7&q=${param1}&expand=${param2}&location.latitude=${latitude}&location.longitude=${longitude}&sort_by=${param3}&location.within=${param4}`;
    console.log(eventUrl);
    $.ajax(url = eventUrl, headers = {
      'Content-Type': 'application/json'
    }, crossDomain = true, method = 'GET').then(function (response) {

      console.log(response);

    });
  }



  function addressSearch(address) {

    clearPreviousResults();

    let key = 'AIzaSyBM-uVbiniH-X5n5wmUhB1zJ4O9VNl57ok';
    let myUrl = 'https://www.googleapis.com/civicinfo/v2/representatives?';
    let urlString = `${myUrl}key=${key}&address=${address}`

    $.ajax(url = urlString, method = 'GET').then(function (response) {

      let divisions = response.divisions;
      let officials = response.officials;
      let offices = response.offices;

      // console.log(divisions);
      let federal_people = [];
      let state_people = [];
      let county_people = [];
      let local_people = [];


      if (divisions === undefined) {

      } else {

        $("#address-image").html(`<img class="img-responsive img-thumbnail" src="https://maps.googleapis.com/maps/api/staticmap?size=800x300&maptype=roadmap&markers=${address}&key=AIzaSyB-hbAFUSdbFonA-MiskuCZclPbDN4Z3u0" alt=""/> `)

        $.each(divisions, function (division_id, division) {
          // console.log(division.name);
          if (typeof division.officeIndices !== 'undefined') {

            $.each(division.officeIndices, function (i, office) {
              let office_name = offices[office];

              $.each(offices[office]['officialIndices'], function (i, official) {
                let info = {
                  'person': null,
                  'office': office_name,
                  'phones': null,
                  'urls': null,
                  'emails': null,
                  'division_id': division_id,
                  'pseudo_id': pseudo_id
                };

                // console.log(officials[official])
                let person = officials[official];
                info['person'] = person;

                if (typeof person.phones !== 'undefined') {
                  info['phones'] = person.phones;
                }
                if (typeof person.urls !== 'undefined') {
                  info['urls'] = person.urls;
                }
                if (typeof person.emails !== 'undefined') {
                  info['emails'] = person.emails;
                }

                if (checkFederal(division_id, office_name)) {
                  info['jurisdiction'] = 'Federal Government';
                  federal_people.push(info);
                } else if (checkState(division_id)) {
                  info['jurisdiction'] = selected_state;
                  state_people.push(info);
                } else if (checkCounty(division_id)) {
                  info['jurisdiction'] = selected_county;
                  county_people.push(info);
                } else {
                  info['jurisdiction'] = selected_local;
                  local_people.push(info);
                }
                all_people[pseudo_id] = info;
                pseudo_id = pseudo_id + 1;

              });

            });
          }
        });
      }

      statePersonInfo(state_people);
      federalPersonInfo(federal_people);
    });
  };

  const clearPreviousResults = function () {
    $("#results-federal").empty();
    $("#results-state").empty();
    $("#federal-header").empty();
    $("#state-header").empty();
  };

  const appendRepresentativeResults = function (resultLoc, key, representatives) {

    $(resultLoc).append(`<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12 card-deck">
                          <div class="card">
                          <img class="card-img-top" style="height: auto; width: 250px;"
                          src = "${representatives[key].person.photoUrl ? representatives[key].person.photoUrl : blankImage}
                          "/>
                        <div class="card-body">
                          <h3 class="card-title" id="rep-name">${representatives[key].person.name}</h3>
                          <p class="card-text" id="rep-office">${representatives[key].office.name}</p>
                          <p class="card-text" id="rep-party">${representatives[key].person.party}</p>
                          <p class="card-text" id="rep-phone">${representatives[key].person.phones[0] ? representatives[key].person.phones[0] : "N/A"}</p>
                          <p class="card-text" id="rep-email">${representatives[key].emails ? representatives[key].emails : "N/A"}</p>
                        </div>
                      </div></div>`)
  }

  const federalPersonInfo = function (federal_people) {
    if (federal_people.length > 0) {
      $("#federal-header").append("<h1> Federal Representatives </h1>")
      let resultLoc = "#results-federal";
      for (let key in federal_people) {
        appendRepresentativeResults(resultLoc, key, federal_people)
      }
    }
  };


  const statePersonInfo = function (state_people) {

    if (state_people.length > 0) {
      $("#state-header").append("<h1> State Representatives </h1>")
      let resultLoc = "#results-state";
      for (let key in state_people) {
        appendRepresentativeResults(resultLoc, key, state_people)
      }
    }
  };


  function checkFederal(division_id, office_name) {
    if (division_id == federal_pattern ||
      cd_pattern.test(division_id) ||
      federal_offices.indexOf(office_name.name) >= 0)
      return true;
    else
      return false;
  }

  function checkState(division_id) {
    if (state_pattern.test(division_id) ||
      sl_pattern.test(division_id))
      return true;
    else
      return false;
  }

  function checkCounty(division_id) {
    if (county_pattern.test(division_id))
      return true;
    else
      return false;
  }
});