$(document).ready(function () {

  let officeName;
  let officialName;
  let image;
  let party;

  var selected_state = '';
  var selected_county = '';
  var selected_local = '';
  var all_people = {};
  var pseudo_id = 1;


  let federal_pattern = "ocd-division/country:us";
  let state_pattern = /ocd-division\/country:us\/state:(\D{2}$)/;
  let cd_pattern = /ocd-division\/country:us\/state:(\D{2})\/cd:/;
  let sl_pattern = /ocd-division\/country:us\/state:(\D{2})\/(sldl:|sldu:)/;
  let county_pattern = /ocd-division\/country:us\/state:\D{2}\/county:\D+/;
  let local_pattern = /ocd-division\/country:us\/state:\D{2}\/place:\D+/;
  let district_pattern = /ocd-division\/country:us\/district:\D+/;


  let federal_offices = ['United States Senate', 'United States House of Representatives']


  google.maps.event.addDomListener(window, 'load', function () {
    let places = new google.maps.places.Autocomplete(document.getElementById('address'));
    google.maps.event.addListener(places, 'place_changed', function () {
      let place = places.getPlace();
      let address = place.formatted_address;
      let add = encodeURIComponent(address);
      addressSearch(add);
    });
  });

  $(document).on("click", "#search", function () {
    let address = $("#address").val().trim();
    let add = encodeURIComponent(address);
    addressSearch(add);
  });

  function addressSearch(address) {
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


      if (divisions === undefined) {

      } else {

        $.each(divisions, function (division_id, division) {
          // console.log(division.name);
          if (typeof division.officeIndices !== 'undefined') {

            $.each(division.officeIndices, function (i, office) {
              var office_name = offices[office];

              $.each(offices[office]['officialIndices'], function (i, official) {
                var info = {
                  'person': null,
                  'office': office_name,
                  'phones': null,
                  'urls': null,
                  'emails': null,
                  'division_id': division_id,
                  'pseudo_id': pseudo_id
                };

                // console.log(officials[official])
                var person = officials[official];
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

      federalPersonInfo(federal_people);
      console.log("********");
      statePersonInfo(state_people);

    });
  };


  const federalPersonInfo = function (federal_people) {
    for (let key in federal_people) {
      console.log(federal_people[key])
      console.log(federal_people[key].person.name);
      console.log(federal_people[key].office.name);
      console.log(federal_people[key].person.party);
      console.log(federal_people[key].person.phones[0]);
      console.log(federal_people[key].emails);
    }
  };


  const statePersonInfo = function (state_people) {
    for (let key in state_people) {
       console.log(state_people[key])
      console.log(state_people[key].person.name);
      console.log(state_people[key].office.name);
      console.log(state_people[key].person.party);
      console.log(state_people[key].person.phones[0]);
      console.log(state_people[key].emails);
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