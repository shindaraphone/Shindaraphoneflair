// App.js — SHINDARA PHONEFLAIR COMPLETE REDESIGN
// Supabase + Paystack + Cart + Checkout + Orders + Tracking
// Mobile-first / responsive / Nigerian states + cities


import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "./supabaseClient.js";
import "./shindara-redesign.css";


/* =========================================================
   CONFIG
   ========================================================= */


const PAYSTACK_KEY =
  "pk_live_d7a7a78de15d84169736f5786afb59709b639905";


const money = (value) =>
  `₦${Number(value || 0).toLocaleString("en-NG")}`;


const generateTrackingNumber = () =>
  `SHP-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;


/* =========================================================
   NIGERIA LOCATIONS
   State -> Local Government Areas / major cities
   ========================================================= */


const NIGERIA_LOCATIONS = {
  Abia: [
    "Aba North",
    "Aba South",
    "Arochukwu",
    "Bende",
    "Ikwuano",
    "Isiala Ngwa North",
    "Isiala Ngwa South",
    "Isuikwuato",
    "Obi Ngwa",
    "Ohafia",
    "Osisioma Ngwa",
    "Umuahia North",
    "Umuahia South",
    "Umunneochi",
  ],


  Adamawa: [
    "Demsa",
    "Fufore",
    "Ganye",
    "Girei",
    "Gombi",
    "Guyuk",
    "Hong",
    "Jada",
    "Jimeta",
    "Lamurde",
    "Madagali",
    "Maiha",
    "Mayo Belwa",
    "Michika",
    "Mubi North",
    "Mubi South",
    "Numan",
    "Shelleng",
    "Song",
    "Toungo",
    "Yola North",
    "Yola South",
  ],


  "Akwa Ibom": [
    "Abak",
    "Eastern Obolo",
    "Eket",
    "Esit Eket",
    "Essien Udim",
    "Etim Ekpo",
    "Etinan",
    "Ibeno",
    "Ibesikpo Asutan",
    "Ibiono Ibom",
    "Ika",
    "Ikono",
    "Ikot Abasi",
    "Ikot Ekpene",
    "Ini",
    "Itu",
    "Mbo",
    "Mkpat Enin",
    "Nsit Atai",
    "Nsit Ibom",
    "Nsit Ubium",
    "Obot Akara",
    "Okobo",
    "Onna",
    "Oron",
    "Oruk Anam",
    "Udung Uko",
    "Ukanfun",
    "Uruan",
    "Urue-Offong/Oruko",
    "Uyo",
  ],


  Anambra: [
    "Aguata",
    "Anambra East",
    "Anambra West",
    "Anaocha",
    "Awka North",
    "Awka South",
    "Ayamelum",
    "Dunukofia",
    "Ekwusigo",
    "Idemili North",
    "Idemili South",
    "Ihiala",
    "Njikoka",
    "Nnewi North",
    "Nnewi South",
    "Ogbaru",
    "Onitsha North",
    "Onitsha South",
    "Orumba North",
    "Orumba South",
    "Oyi",
  ],


  Bauchi: [
    "Bauchi",
    "Bogoro",
    "Damban",
    "Darazo",
    "Dass",
    "Gamawa",
    "Ganjuwa",
    "Giade",
    "Itas/Gadau",
    "Jama'are",
    "Katagum",
    "Kirfi",
    "Misau",
    "Ningi",
    "Shira",
    "Tafawa Balewa",
    "Toro",
    "Warji",
    "Zaki",
  ],


  Bayelsa: [
    "Brass",
    "Ekeremor",
    "Kolokuma/Opokuma",
    "Nembe",
    "Ogbia",
    "Sagbama",
    "Southern Ijaw",
    "Yenagoa",
  ],


  Benue: [
    "Ado",
    "Agatu",
    "Apa",
    "Buruku",
    "Gbajimba",
    "Gboko",
    "Guma",
    "Gwer East",
    "Gwer West",
    "Katsina-Ala",
    "Konshisha",
    "Kwande",
    "Logo",
    "Makurdi",
    "Ogbadibo",
    "Ohimini",
    "Oju",
    "Okpokwu",
    "Otukpo",
    "Tarka",
    "Ukum",
    "Ushongo",
    "Vandeikya",
  ],


  Borno: [
    "Abadam",
    "Askira/Uba",
    "Bama",
    "Bayo",
    "Biu",
    "Chibok",
    "Damboa",
    "Dikwa",
    "Gubio",
    "Guzamala",
    "Gwoza",
    "Hawul",
    "Jere",
    "Kaga",
    "Kala/Balge",
    "Konduga",
    "Kukawa",
    "Kwaya Kusar",
    "Mafa",
    "Magumeri",
    "Maiduguri",
    "Marte",
    "Mobbar",
    "Monguno",
    "Ngala",
    "Nganzai",
    "Shani",
  ],


  "Cross River": [
    "Abi",
    "Akamkpa",
    "Akpabuyo",
    "Bakassi",
    "Bekwarra",
    "Biase",
    "Boki",
    "Calabar Municipal",
    "Calabar South",
    "Etung",
    "Ikom",
    "Obanliku",
    "Obubra",
    "Obudu",
    "Odukpani",
    "Ogoja",
    "Yakuur",
    "Yala",
  ],


  Delta: [
    "Aniocha North",
    "Aniocha South",
    "Bomadi",
    "Burutu",
    "Ethiope East",
    "Ethiope West",
    "Ika North East",
    "Ika South",
    "Isoko North",
    "Isoko South",
    "Ndokwa East",
    "Ndokwa West",
    "Okpe",
    "Oshimili North",
    "Oshimili South",
    "Patani",
    "Sapele",
    "Udu",
    "Ughelli North",
    "Ughelli South",
    "Ukwuani",
    "Uvwie",
    "Warri North",
    "Warri South",
    "Warri South West",
  ],


  Ebonyi: [
    "Abakaliki",
    "Afikpo North",
    "Afikpo South",
    "Ebonyi",
    "Ezza North",
    "Ezza South",
    "Ikwo",
    "Ishielu",
    "Ivo",
    "Izzi",
    "Ohaukwu",
    "Onicha",
  ],


  Edo: [
    "Akoko-Edo",
    "Egor",
    "Esan Central",
    "Esan North-East",
    "Esan South-East",
    "Esan West",
    "Etsako Central",
    "Etsako East",
    "Etsako West",
    "Igueben",
    "Ikpoba-Okha",
    "Oredo",
    "Orhionmwon",
    "Ovia North-East",
    "Ovia South-West",
    "Owan East",
    "Owan West",
    "Uhunmwonde",
  ],


  Ekiti: [
    "Ado Ekiti",
    "Aiyekire",
    "Efon",
    "Ekiti East",
    "Ekiti South-West",
    "Ekiti West",
    "Emure",
    "Gbonyin",
    "Ido Osi",
    "Ijero",
    "Ikere",
    "Ikole",
    "Ilejemeje",
    "Irepodun/Ifelodun",
    "Ise/Orun",
    "Moba",
    "Oye",
  ],


  Enugu: [
    "Aninri",
    "Awgu",
    "Enugu East",
    "Enugu North",
    "Enugu South",
    "Ezeagu",
    "Igbo Etiti",
    "Igbo Eze North",
    "Igbo Eze South",
    "Isi-Uzo",
    "Nkanu East",
    "Nkanu West",
    "Nsukka",
    "Oji River",
    "Udenu",
    "Udi",
    "Uzo-Uwani",
  ],


  FCT: [
    "Abaji",
    "Bwari",
    "Gwagwalada",
    "Kuje",
    "Kwali",
    "Municipal Area Council",
    "Abuja",
    "Asokoro",
    "Garki",
    "Gwarinpa",
    "Jabi",
    "Kubwa",
    "Lugbe",
    "Maitama",
    "Nyanya",
    "Wuse",
  ],


  Gombe: [
    "Akko",
    "Balanga",
    "Billiri",
    "Dukku",
    "Funakaye",
    "Gombe",
    "Kaltungo",
    "Kwami",
    "Nafada",
    "Shongom",
    "Yamaltu-Deba",
  ],


  Imo: [
    "Ahiazu Mbaise",
    "Ehime Mbano",
    "Ezinihitte",
    "Ideato North",
    "Ideato South",
    "Ihitte/Uboma",
    "Ikeduru",
    "Isiala Mbano",
    "Isu",
    "Mbaitoli",
    "Ngor Okpala",
    "Njaba",
    "Nkwerre",
    "Nwangele",
    "Obowo",
    "Oguta",
    "Ohaji/Egbema",
    "Okigwe",
    "Orlu",
    "Orsu",
    "Oru East",
    "Oru West",
    "Owerri Municipal",
    "Owerri North",
    "Owerri West",
    "Unuimo",
  ],


  Jigawa: [
    "Auyo",
    "Babura",
    "Biriniwa",
    "Birnin Kudu",
    "Buji",
    "Dutse",
    "Gagarawa",
    "Garki",
    "Gumel",
    "Guri",
    "Gwaram",
    "Gwiwa",
    "Hadejia",
    "Jahun",
    "Kafin Hausa",
    "Kaugama",
    "Kazaure",
    "Kiri Kasama",
    "Kiyawa",
    "Maigatari",
    "Malam Madori",
    "Miga",
    "Ringim",
    "Roni",
    "Sule Tankarkar",
    "Taura",
    "Yankwashi",
  ],


  Kaduna: [
    "Birnin Gwari",
    "Chikun",
    "Giwa",
    "Igabi",
    "Ikara",
    "Jaba",
    "Jema'a",
    "Kachia",
    "Kaduna North",
    "Kaduna South",
    "Kagarko",
    "Kajuru",
    "Kaura",
    "Kauru",
    "Kubau",
    "Kudan",
    "Lere",
    "Makarfi",
    "Sabon Gari",
    "Sanga",
    "Soba",
    "Zangon Kataf",
    "Zaria",
  ],


  Kano: [
    "Ajingi",
    "Albasu",
    "Bagwai",
    "Bebeji",
    "Bichi",
    "Bunkure",
    "Dala",
    "Dambatta",
    "Dawakin Kudu",
    "Dawakin Tofa",
    "Doguwa",
    "Fagge",
    "Gabasawa",
    "Garko",
    "Garun Mallam",
    "Gaya",
    "Gezawa",
    "Gwale",
    "Gwarzo",
    "Kabo",
    "Kano Municipal",
    "Karaye",
    "Kibiya",
    "Kiru",
    "Kumbotso",
    "Kunchi",
    "Kura",
    "Madobi",
    "Makoda",
    "Minjibir",
    "Nasarawa",
    "Rano",
    "Rimin Gado",
    "Rogo",
    "Shanono",
    "Sumaila",
    "Takai",
    "Tarauni",
    "Tofa",
    "Tsanyawa",
    "Tudun Wada",
    "Ungogo",
    "Warawa",
    "Wudil",
  ],


  Katsina: [
    "Bakori",
    "Batagarawa",
    "Batsari",
    "Baure",
    "Bindawa",
    "Charanchi",
    "Dan Musa",
    "Dandume",
    "Danja",
    "Daura",
    "Dutsi",
    "Dutsin-Ma",
    "Faskari",
    "Funtua",
    "Ingawa",
    "Jibia",
    "Kafur",
    "Kaita",
    "Kankara",
    "Kankia",
    "Katsina",
    "Kurfi",
    "Kusada",
    "Mai'Adua",
    "Malumfashi",
    "Mani",
    "Mashi",
    "Matazu",
    "Musawa",
    "Rimi",
    "Sabuwa",
    "Safana",
    "Sandamu",
    "Zango",
  ],


  Kebbi: [
    "Aleiro",
    "Arewa",
    "Argungu",
    "Augie",
    "Bagudo",
    "Birnin Kebbi",
    "Birnin Kebbi Municipal",
    "Bunza",
    "Dandi",
    "Dankowasagu",
    "Fakai",
    "Gwandu",
    "Jega",
    "Kalgo",
    "Koko/Besse",
    "Maiyama",
    "Ngaski",
    "Sakaba",
    "Shanga",
    "Suru",
    "Wasagu/Danko",
    "Yauri",
    "Zuru",
  ],


  Kogi: [
    "Adavi",
    "Ajaokuta",
    "Ankpa",
    "Bassa",
    "Dekina",
    "Ibaji",
    "Idah",
    "Igalamela-Odolu",
    "Ijumu",
    "Kabba/Bunu",
    "Kogi",
    "Lokoja",
    "Mopa-Muro",
    "Ofu",
    "Ogori/Magongo",
    "Okehi",
    "Okene",
    "Olamaboro",
    "Omala",
    "Yagba East",
    "Yagba West",
  ],


  Kwara: [
    "Asa",
    "Baruten",
    "Edu",
    "Ekiti",
    "Ifelodun",
    "Ilorin East",
    "Ilorin South",
    "Ilorin West",
    "Irepodun",
    "Isin",
    "Kaiama",
    "Moro",
    "Offa",
    "Oke Ero",
    "Oyun",
    "Pategi",
    "Ilorin",
    "Jebba",
    "Lafiagi",
  ],


  Lagos: [
    "Agege",
    "Ajeromi-Ifelodun",
    "Alimosho",
    "Amuwo-Odofin",
    "Apapa",
    "Badagry",
    "Epe",
    "Eti-Osa",
    "Ibeju-Lekki",
    "Ifako-Ijaiye",
    "Ikeja",
    "Ikorodu",
    "Kosofe",
    "Lagos Island",
    "Lagos Mainland",
    "Mushin",
    "Ojo",
    "Oshodi-Isolo",
    "Shomolu",
    "Surulere",
    "Lekki",
    "Victoria Island",
    "Yaba",
  ],


  Nasarawa: [
    "Akwanga",
    "Awe",
    "Doma",
    "Karu",
    "Keana",
    "Keffi",
    "Kokona",
    "Lafia",
    "Nasarawa",
    "Nasarawa Eggon",
    "Obi",
    "Toto",
    "Wamba",
  ],


  Niger: [
    "Agaie",
    "Agwara",
    "Bida",
    "Borgu",
    "Bosso",
    "Chanchaga",
    "Edati",
    "Gbako",
    "Gurara",
    "Katcha",
    "Kontagora",
    "Lapai",
    "Lavun",
    "Magama",
    "Mariga",
    "Mashegu",
    "Mokwa",
    "Munya",
    "Paikoro",
    "Rafi",
    "Rijau",
    "Shiroro",
    "Suleja",
    "Tafa",
    "Wushishi",
    "Minna",
  ],


  Ogun: [
    "Abeokuta North",
    "Abeokuta South",
    "Ado-Odo/Ota",
    "Ewekoro",
    "Ifo",
    "Ijebu East",
    "Ijebu North",
    "Ijebu North East",
    "Ijebu Ode",
    "Ikenne",
    "Imeko Afon",
    "Ipokia",
    "Obafemi Owode",
    "Odeda",
    "Odogbolu",
    "Ogun Waterside",
    "Remo North",
    "Sagamu",
    "Yewa North",
    "Yewa South",
    "Abeokuta",
    "Ota",
    "Ilaro",
    "Iperu",
    "Ishara",
  ],


  Ondo: [
    "Akoko North-East",
    "Akoko North-West",
    "Akoko South-East",
    "Akoko South-West",
    "Akure North",
    "Akure South",
    "Ese Odo",
    "Idanre",
    "Ifedore",
    "Ilaje",
    "Ile Oluji/Okeigbo",
    "Irele",
    "Odigbo",
    "Okitipupa",
    "Ondo East",
    "Ondo West",
    "Ose",
    "Owo",
    "Akure",
    "Ikare",
    "Ondo",
    "Ore",
  ],


  Osun: [
    "Atakunmosa East",
    "Atakunmosa West",
    "Ayedaade",
    "Ayedire",
    "Boluwaduro",
    "Boripe",
    "Ede North",
    "Ede South",
    "Egbedore",
    "Ejigbo",
    "Ife Central",
    "Ife East",
    "Ife North",
    "Ife South",
    "Ifedayo",
    "Ifelodun",
    "Ila",
    "Ilesa East",
    "Ilesa West",
    "Irepodun",
    "Irewole",
    "Isokan",
    "Iwo",
    "Obokun",
    "Odo Otin",
    "Ola Oluwa",
    "Olorunda",
    "Oriade",
    "Orolu",
    "Osogbo",
    "Ikirun",
    "Ila Orangun",
  ],


  Oyo: [
    "Afijio",
    "Akinyele",
    "Atiba",
    "Atisbo",
    "Egbeda",
    "Ibadan North",
    "Ibadan North-East",
    "Ibadan North-West",
    "Ibadan South-East",
    "Ibadan South-West",
    "Ibarapa Central",
    "Ibarapa East",
    "Ibarapa North",
    "Ido",
    "Irepo",
    "Iseyin",
    "Itesiwaju",
    "Iwajowa",
    "Kajola",
    "Lagelu",
    "Ogbomosho North",
    "Ogbomosho South",
    "Ogo Oluwa",
    "Olorunsogo",
    "Oluyole",
    "Ona Ara",
    "Orelope",
    "Oriire",
    "Oyo East",
    "Oyo West",
    "Saki East",
    "Saki West",
    "Surulere",
    "Ibadan",
    "Oyo",
    "Saki",
    "Ogbomosho",
  ],


  Plateau: [
    "Barkin Ladi",
    "Bassa",
    "Bokkos",
    "Jos East",
    "Jos North",
    "Jos South",
    "Kanam",
    "Kanke",
    "Langtang North",
    "Langtang South",
    "Mangu",
    "Mikang",
    "Pankshin",
    "Qua'an Pan",
    "Riyom",
    "Shendam",
    "Wase",
    "Jos",
  ],


  Rivers: [
    "Abua/Odual",
    "Ahoada East",
    "Ahoada West",
    "Akuku-Toru",
    "Andoni",
    "Asari-Toru",
    "Bonny",
    "Degema",
    "Eleme",
    "Emohua",
    "Etche",
    "Gokana",
    "Ikwerre",
    "Khana",
    "Obio/Akpor",
    "Ogba/Egbema/Ndoni",
    "Ogu/Bolo",
    "Okrika",
    "Omuma",
    "Opobo/Nkoro",
    "Oyigbo",
    "Port Harcourt",
    "Tai",
  ],


  Sokoto: [
    "Binji",
    "Bodinga",
    "Dange Shuni",
    "Gada",
    "Goronyo",
    "Gudu",
    "Gwadabawa",
    "Illela",
    "Isa",
    "Kebbe",
    "Kware",
    "Rabah",
    "Sabon Birni",
    "Shagari",
    "Silame",
    "Sokoto North",
    "Sokoto South",
    "Tambuwal",
    "Tangaza",
    "Tureta",
    "Wamakko",
    "Wurno",
    "Yabo",
    "Sokoto",
  ],


  Taraba: [
    "Ardo Kola",
    "Bali",
    "Donga",
    "Gashaka",
    "Gassol",
    "Ibi",
    "Jalingo",
    "Karim Lamido",
    "Kumi",
    "Lau",
    "Sardauna",
    "Takum",
    "Ussa",
    "Wukari",
    "Yorro",
    "Zing",
  ],


  Yobe: [
    "Bade",
    "Bursari",
    "Damaturu",
    "Fika",
    "Fune",
    "Geidam",
    "Gujba",
    "Gulani",
    "Jakusko",
    "Karasuwa",
    "Machina",
    "Nangere",
    "Nguru",
    "Potiskum",
    "Tarmuwa",
    "Yunusari",
    "Yusufari",
  ],


  Zamfara: [
    "Anka",
    "Bakura",
    "Birnin Magaji/Kiyaw",
    "Bukunyu",
    "Bungudu",
    "Bukkuyum",
    "Gummi",
    "Gusau",
    "Kaura Namoda",
    "Maradun",
    "Maru",
    "Shinkafi",
    "Talata Mafara",
    "Tsafe",
    "Zurmi",
  ],
};


/* =========================================================
   CATEGORIES
   ========================================================= */


// Fallback only — used if the categories table is empty or fails to load.
const FALLBACK_CATEGORIES = [
  { name: "Phone Cases", icon: "▢" },
  { name: "Chargers", icon: "⚡" },
  { name: "Cables", icon: "⌁" },
  { name: "Power Banks", icon: "▮" },
  { name: "Audio", icon: "◐" },
  { name: "Smart Watches", icon: "◔" },
  { name: "Screen Protectors", icon: "◈" },
];


/* =========================================================
   HELPERS
   ========================================================= */


const getProductImage = (product) =>
  product?.image_url ||
  product?.image ||
  product?.imageUrl ||
  "";


const normalizeCategory = (value) =>
  String(value || "").trim().toLowerCase();


const categoryMatches = (product, selectedCategory) => {
  if (selectedCategory === "All") return true;


  const cat = normalizeCategory(product?.category);
  const target = normalizeCategory(selectedCategory);


  if (cat.includes(target)) return true;


  if (
    selectedCategory === "Audio" &&
    /(airpod|airpods|earbud|earbuds|headphone|headphones|speaker|audio)/i.test(
      `${product?.name || ""} ${product?.category || ""}`
    )
  ) {
    return true;
  }


  if (
    selectedCategory === "Smart Watches" &&
    /(smartwatch|smart watch|apple watch|watch)/i.test(
      `${product?.name || ""} ${product?.category || ""}`
    )
  ) {
    return true;
  }


  if (
    selectedCategory === "Phone Cases" &&
    /(case|cover)/i.test(`${product?.name || ""} ${product?.category || ""}`)
  ) {
    return true;
  }


  if (
    selectedCategory === "Power Banks" &&
    /(power ?bank|powerbank)/i.test(
      `${product?.name || ""} ${product?.category || ""}`
    )
  ) {
    return true;
  }


  if (
    selectedCategory === "Chargers" &&
    /(charger|charging)/i.test(
      `${product?.name || ""} ${product?.category || ""}`
    )
  ) {
    return true;
  }


  if (
    selectedCategory === "Cables" &&
    /(cable|cord)/i.test(`${product?.name || ""} ${product?.category || ""}`)
  ) {
    return true;
  }


  if (
    selectedCategory === "Screen Protectors" &&
    /(screen protector|tempered|protector)/i.test(
      `${product?.name || ""} ${product?.category || ""}`
    )
  ) {
    return true;
  }


  return false;
};


/* =========================================================
   APP
   ========================================================= */


export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);


  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [siteSettings, setSiteSettings] = useState({ logo_url: "", tagline: "" });


  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [processing, setProcessing] = useState(false);


  const [modal, setModal] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);


  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");


  const [notice, setNotice] = useState("");


  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");


  const [checkout, setCheckout] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    state: "",
    city: "",
  });


  const [checkoutError, setCheckoutError] = useState("");


  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "light";
    } catch {
      return "light";
    }
  });


  const [mobileMenu, setMobileMenu] = useState(false);


  const noticeTimer = useRef(null);


  /* =======================================================
     NOTICE
     ======================================================= */


  const showNotice = useCallback((message) => {
    setNotice(message);


    if (noticeTimer.current) {
      clearTimeout(noticeTimer.current);
    }


    noticeTimer.current = setTimeout(() => {
      setNotice("");
    }, 3500);
  }, []);


  /* =======================================================
     THEME
     ======================================================= */


  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch {}


    document.documentElement.dataset.theme = theme;
  }, [theme]);


  /* =======================================================
     PRODUCT LOADING
     ======================================================= */


  const loadProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });


      if (error) {
        console.error("Products:", error);
        return;
      }


      setProducts(data || []);
    } catch (error) {
      console.error(error);
    }
  }, []);


  /* =======================================================
     CATEGORIES & SITE SETTINGS
     ======================================================= */


  const loadCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setCategories(data.map((c) => ({ name: c.name, icon: c.icon || "◆" })));
      }
    } catch (error) {
      console.error("Categories:", error);
      // keep FALLBACK_CATEGORIES on failure
    }
  }, []);


  const loadSiteSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSiteSettings({
          logo_url: data.logo_url || "",
          tagline: data.tagline || "",
        });
      }
    } catch (error) {
      console.error("Site settings:", error);
    }
  }, []);


  /* =======================================================
     PROFILE
     ======================================================= */


  const loadProfile = useCallback(async (id) => {
    if (!id) return;


    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();


      if (error) {
        console.error("Profile:", error);
        return;
      }


      if (data) {
        setProfile(data);


        setCheckout((previous) => ({
          ...previous,
          name: data.full_name || previous.name || "",
          phone: data.phone || previous.phone || "",
          email: data.email || previous.email || "",
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }, []);


  /* =======================================================
     CART
     ======================================================= */


  const loadCart = useCallback(async (id) => {
    if (!id) return;


    setCartLoading(true);


    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          products:product_id(*)
        `)
        .eq("user_id", id);


      if (error) {
        console.error("Cart:", error);
        setCart([]);
        return;
      }


      const formatted = (data || [])
        .filter((item) => item.products)
        .map((item) => {
          const product = item.products;


          return {
            ...item,
            product,
            subtotal:
              Number(product?.price || 0) * Number(item.quantity || 0),
          };
        });


      setCart(formatted);
    } catch (error) {
      console.error(error);
    } finally {
      setCartLoading(false);
    }
  }, []);


  /* =======================================================
     ORDERS
     ======================================================= */


  const loadOrders = useCallback(async (id) => {
    if (!id) return;


    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });


      if (error) {
        console.error("Orders:", error);
        setOrders([]);
        return;
      }


      const orderData = data || [];


      const completeOrders = await Promise.all(
        orderData.map(async (order) => {
          const { data: items, error: itemsError } = await supabase
            .from("order_items")
            .select(`
              *,
              products:product_id(*)
            `)
            .eq("order_id", order.id);


          if (itemsError) {
            console.error("Order items:", itemsError);
          }


          return {
            ...order,
            items: items || [],
          };
        })
      );


      setOrders(completeOrders);
    } catch (error) {
      console.error(error);
    }
  }, []);


  /* =======================================================
     INITIALIZATION
     ======================================================= */


  useEffect(() => {
    let mounted = true;


    const initialize = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();


        if (!mounted) return;


        const currentUser = session?.user || null;


        setUser(currentUser);


        await Promise.all([loadProducts(), loadCategories(), loadSiteSettings()]);


        if (currentUser) {
          await Promise.all([
            loadProfile(currentUser.id),
            loadCart(currentUser.id),
            loadOrders(currentUser.id),
          ]);
        }
      } catch (error) {
        console.error("Initialization:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };


    initialize();


    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;


      setUser(currentUser);


      if (currentUser) {
        await Promise.all([
          loadProfile(currentUser.id),
          loadCart(currentUser.id),
          loadOrders(currentUser.id),
        ]);
      } else {
        setProfile(null);
        setCart([]);
        setOrders([]);
      }
    });


    return () => {
      mounted = false;
      subscription?.unsubscribe();


      if (noticeTimer.current) {
        clearTimeout(noticeTimer.current);
      }
    };
  }, [loadProducts, loadProfile, loadCart, loadOrders]);


  /* =======================================================
     CART COMPUTED
     ======================================================= */


  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + Number(item.subtotal || 0),
        0
      ),
    [cart]
  );


  const cartCount = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      ),
    [cart]
  );


  /* =======================================================
     ADD TO CART
     ======================================================= */


  const addToCart = useCallback(
    async (product) => {
      if (!user) {
        setAuthMode("login");
        setModal("auth");
        showNotice("Please sign in to add products to your cart.");
        return;
      }


      const stock = Number(product?.stock || 0);


      if (stock <= 0) {
        showNotice("This product is currently sold out.");
        return;
      }


      try {
        const existing = cart.find(
          (item) => item.product_id === product.id
        );


        if (existing) {
          const nextQuantity = Number(existing.quantity || 0) + 1;


          if (nextQuantity > stock) {
            showNotice(`Only ${stock} available.`);
            return;
          }


          const { error } = await supabase
            .from("cart_items")
            .update({ quantity: nextQuantity })
            .eq("id", existing.id)
            .eq("user_id", user.id);


          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("cart_items")
            .insert({
              user_id: user.id,
              product_id: product.id,
              quantity: 1,
            });


          if (error) throw error;
        }


        await loadCart(user.id);
        showNotice(`${product.name} added to your bag.`);
      } catch (error) {
        console.error("Add cart:", error);
        showNotice("Could not add this product.");
      }
    },
    [user, cart, loadCart, showNotice]
  );


  /* =======================================================
     UPDATE QUANTITY
     ======================================================= */


  const updateQuantity = useCallback(
    async (item, change) => {
      if (!user || !item) return;


      const current = Number(item.quantity || 0);
      const next = current + change;


      try {
        if (next <= 0) {
          await supabase
            .from("cart_items")
            .delete()
            .eq("id", item.id)
            .eq("user_id", user.id);


          await loadCart(user.id);
          return;
        }


        const stock = Number(item.product?.stock || 0);


        if (next > stock) {
          showNotice(`Only ${stock} available.`);
          return;
        }


        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: next })
          .eq("id", item.id)
          .eq("user_id", user.id);


        if (error) throw error;


        await loadCart(user.id);
      } catch (error) {
        console.error("Quantity:", error);
        showNotice("Could not update quantity.");
      }
    },
    [user, loadCart, showNotice]
  );


  /* =======================================================
     REMOVE CART ITEM
     ======================================================= */


  const removeFromCart = useCallback(
    async (item) => {
      if (!user || !item) return;


      try {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("id", item.id)
          .eq("user_id", user.id);


        if (error) throw error;


        await loadCart(user.id);
        showNotice("Item removed.");
      } catch (error) {
        console.error(error);
        showNotice("Could not remove item.");
      }
    },
    [user, loadCart, showNotice]
  );


  /* =======================================================
     CLEAR CART
     ======================================================= */


  const clearCart = useCallback(async () => {
    if (!user) return false;


    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);


      if (error) throw error;


      setCart([]);
      return true;
    } catch (error) {
      console.error("Clear cart:", error);
      return false;
    }
  }, [user]);


  /* =======================================================
     AUTH
     ======================================================= */


  const resetAuthForm = useCallback(() => {
    setAuthError("");
  }, []);


  const handleAuth = useCallback(
    async (event) => {
      event.preventDefault();


      setAuthLoading(true);
      setAuthError("");


      try {
        const email = authEmail.trim().toLowerCase();
        const password = authPassword;


        if (!email || !password) {
          setAuthError("Please enter your email and password.");
          return;
        }


        if (password.length < 6) {
          setAuthError("Password must be at least 6 characters.");
          return;
        }


        if (authMode === "signup") {
          const name = authName.trim();
          const phone = authPhone.trim();


          if (!name || !phone) {
            setAuthError("Please enter your full name and phone number.");
            return;
          }


          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
                phone,
              },
            },
          });


          if (error) throw error;


          if (data?.user) {
            const { error: profileError } = await supabase
              .from("profiles")
              .upsert({
                id: data.user.id,
                email,
                full_name: name,
                phone,
              });


            if (profileError) {
              console.warn("Profile creation:", profileError);
            }
          }


          if (data?.session) {
            setModal(null);
            showNotice("Welcome to SHINDARA!");
          } else {
            setAuthError(
              "Account created. Please check your email to verify your account."
            );
          }
        } else {
          const { data, error } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });


          if (error) throw error;


          if (data?.user) {
            setModal(null);
            showNotice("Welcome back!");
          }
        }
      } catch (error) {
        console.error("Auth:", error);


        let message = error?.message || "Something went wrong.";


        if (/invalid login credentials/i.test(message)) {
          message = "Incorrect email or password.";
        }


        setAuthError(message);
      } finally {
        setAuthLoading(false);
      }
    },
    [
      authEmail,
      authPassword,
      authName,
      authPhone,
      authMode,
      showNotice,
    ]
  );


  /* =======================================================
     GOOGLE LOGIN
     ======================================================= */


  const handleGoogleLogin = useCallback(async () => {
    setAuthLoading(true);
    setAuthError("");


    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });


      if (error) throw error;
    } catch (error) {
      console.error(error);
      setAuthError(error?.message || "Google sign-in failed.");
      setAuthLoading(false);
    }
  }, []);


  /* =======================================================
     LOGOUT
     ======================================================= */


  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error(error);
    }


    setUser(null);
    setProfile(null);
    setCart([]);
    setOrders([]);
    setModal(null);


    showNotice("You have been signed out.");
  }, [showNotice]);


  /* =======================================================
     PAYSTACK SCRIPT
     ======================================================= */


  const loadPaystack = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (typeof window !== "undefined" && window.PaystackPop) {
        resolve(true);
        return;
      }


      const existing = document.querySelector(
        'script[src="https://js.paystack.co/v1/inline.js"]'
      );


      if (existing) {
        let elapsed = 0;


        const interval = setInterval(() => {
          if (window.PaystackPop) {
            clearInterval(interval);
            resolve(true);
          }


          elapsed += 200;


          if (elapsed >= 10000) {
            clearInterval(interval);
            reject(new Error("Paystack took too long to load."));
          }
        }, 200);


        return;
      }


      const script = document.createElement("script");


      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;


      script.onload = () => {
        if (window.PaystackPop) {
          resolve(true);
        } else {
          reject(new Error("Paystack loaded but is unavailable."));
        }
      };


      script.onerror = () => {
        reject(
          new Error(
            "Paystack could not load. Check your internet connection and refresh."
          )
        );
      };


      document.head.appendChild(script);
    });
  }, []);


  /* =======================================================
     CREATE ORDER AFTER PAYMENT
     ======================================================= */


  const saveSuccessfulOrder = useCallback(
    async (paymentReference) => {
      if (!user) throw new Error("Customer session missing.");


      if (!cart.length) {
        throw new Error("Your cart is empty.");
      }


      /* Prevent duplicate order */
      const { data: existingOrder, error: duplicateError } =
        await supabase
          .from("orders")
          .select("*")
          .eq("payment_reference", paymentReference)
          .maybeSingle();


      if (duplicateError) {
        console.warn("Duplicate check:", duplicateError);
      }


      if (existingOrder) {
        await clearCart();
        await loadOrders(user.id);


        return existingOrder;
      }


      /* Verify stock one more time */
      const productIds = cart.map((item) => item.product_id);


      const { data: latestProducts, error: latestError } =
        await supabase
          .from("products")
          .select("*")
          .in("id", productIds);


      if (latestError) throw latestError;


      for (const item of cart) {
        const latestProduct = latestProducts?.find(
          (product) => product.id === item.product_id
        );


        const stock = Number(latestProduct?.stock || 0);
        const quantity = Number(item.quantity || 0);


        if (!latestProduct || stock < quantity) {
          throw new Error(
            `${item.product?.name || "A product"} is no longer available in the requested quantity.`
          );
        }
      }


      const trackingNumber = generateTrackingNumber();


      const orderPayload = {
        user_id: user.id,
        customer_name: checkout.name.trim(),
        customer_phone: checkout.phone.trim(),
        customer_email: checkout.email.trim(),
        delivery_address: checkout.address.trim(),
        delivery_state: checkout.state,
        delivery_city: checkout.city,
        total: Number(cartTotal),
        payment_status: "paid",
        payment_reference: paymentReference,
        status: "processing",
        tracking_number: trackingNumber,
      };


      const {
        data: order,
        error: orderError,
      } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select()
        .single();


      if (orderError || !order) {
        throw new Error(
          orderError?.message ||
            `Order could not be saved. Payment reference: ${paymentReference}`
        );
      }


      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: Number(item.quantity),
        price: Number(item.product?.price || 0),
      }));


      const {
        error: itemsError,
      } = await supabase
        .from("order_items")
        .insert(orderItems);


      if (itemsError) {
        console.error("Order items:", itemsError);
        throw new Error(
          `Order was created but items could not be saved. Reference: ${paymentReference}`
        );
      }


      /*
       * Reduce stock.
       * This keeps the frontend behavior consistent with the
       * current database structure.
       */
      for (const item of cart) {
        const latestProduct = latestProducts?.find(
          (product) => product.id === item.product_id
        );


        if (!latestProduct) continue;


        const oldStock = Number(latestProduct.stock || 0);
        const quantity = Number(item.quantity || 0);


        await supabase
          .from("products")
          .update({
            stock: Math.max(0, oldStock - quantity),
          })
          .eq("id", item.product_id);
      }


      /* Only clear cart after order + items have been saved */
      await clearCart();


      await Promise.all([
        loadOrders(user.id),
        loadProducts(),
      ]);


      return order;
    },
    [
      user,
      cart,
      checkout,
      cartTotal,
      clearCart,
      loadOrders,
      loadProducts,
    ]
  );


  /* =======================================================
     PAYMENT SUCCESS
     ======================================================= */


  const handlePaymentSuccess = useCallback(
    async (response) => {
      const reference =
        response?.reference ||
        response?.trxref ||
        "";


      if (!reference) {
        setProcessing(false);
        setCheckoutError(
          "Payment completed but no payment reference was returned. Please contact us."
        );
        return;
      }


      try {
        setCheckoutError("Confirming your payment...");


        const order = await saveSuccessfulOrder(reference);


        setSelectedOrder(order);
        setProcessing(false);
        setCheckoutError("");
        setModal("tracking");


        showNotice("Payment successful! Your order is confirmed.");
      } catch (error) {
        console.error("Payment order:", error);


        setProcessing(false);


        setCheckoutError(
          `Payment was received, but your order could not be completed automatically. Payment reference: ${reference}`
        );
      }
    },
    [saveSuccessfulOrder, showNotice]
  );


  /* =======================================================
     PAYMENT CLOSED
     ======================================================= */


  const handlePaymentClose = useCallback(() => {
    if (!processing) return;


    setProcessing(false);
    setCheckoutError("Payment window was closed.");
  }, [processing]);


  /* =======================================================
     START PAYMENT
     ======================================================= */


  const handlePayment = useCallback(
    async (event) => {
      event.preventDefault();


      if (processing) return;


      if (!user) {
        setCheckoutError("Please sign in before checkout.");
        return;
      }


      if (!cart.length) {
        setCheckoutError("Your cart is empty.");
        return;
      }


      const required = [
        ["name", "full name"],
        ["phone", "phone number"],
        ["email", "email"],
        ["address", "delivery address"],
        ["state", "state"],
        ["city", "city"],
      ];


      for (const [field, label] of required) {
        if (!String(checkout[field] || "").trim()) {
          setCheckoutError(`Please enter your ${label}.`);
          return;
        }
      }


      if (!/^\S+@\S+\.\S+$/.test(checkout.email.trim())) {
        setCheckoutError("Please enter a valid email address.");
        return;
      }


      const phoneDigits = checkout.phone.replace(/\D/g, "");


      if (phoneDigits.length < 10) {
        setCheckoutError("Please enter a valid Nigerian phone number.");
        return;
      }


      /* Fresh stock validation */
      try {
        const ids = cart.map((item) => item.product_id);


        const { data: freshProducts, error } = await supabase
          .from("products")
          .select("*")
          .in("id", ids);


        if (error) throw error;


        for (const item of cart) {
          const fresh = freshProducts?.find(
            (product) => product.id === item.product_id
          );


          if (
            !fresh ||
            Number(fresh.stock || 0) < Number(item.quantity || 0)
          ) {
            setCheckoutError(
              `${item.product?.name || "A product"} does not have enough stock.`
            );


            await loadCart(user.id);
            return;
          }
        }
      } catch (error) {
        console.error("Stock check:", error);
        setCheckoutError(
          "Could not verify stock. Please refresh and try again."
        );
        return;
      }


      setProcessing(true);
      setCheckoutError("Opening secure payment...");


      try {
        await loadPaystack();


        if (!window.PaystackPop) {
          throw new Error(
            "Paystack is unavailable. Please refresh and try again."
          );
        }


        const reference =
          `SHP-${user.id.slice(0, 8)}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 7)
            .toUpperCase()}`;


        const amount = Math.round(Number(cartTotal) * 100);


        if (!amount || amount <= 0) {
          throw new Error("Invalid payment amount.");
        }


        const config = {
          key: PAYSTACK_KEY,
          email: checkout.email.trim(),
          amount,
          currency: "NGN",
          ref: reference,


          metadata: {
            custom_fields: [
              {
                display_name: "Customer Name",
                variable_name: "customer_name",
                value: checkout.name.trim(),
              },
              {
                display_name: "Customer Phone",
                variable_name: "customer_phone",
                value: checkout.phone.trim(),
              },
              {
                display_name: "Delivery State",
                variable_name: "delivery_state",
                value: checkout.state,
              },
              {
                display_name: "Delivery City",
                variable_name: "delivery_city",
                value: checkout.city,
              },
              {
                display_name: "User ID",
                variable_name: "user_id",
                value: user.id,
              },
            ],
          },


          callback: (response) => {
            handlePaymentSuccess(response);
          },


          onClose: () => {
            handlePaymentClose();
          },
        };


        const handler = window.PaystackPop.setup(config);


        if (!handler) {
          throw new Error("Paystack could not initialize.");
        }


        setCheckoutError("");


        handler.openIframe();
      } catch (error) {
        console.error("Paystack:", error);


        setProcessing(false);


        setCheckoutError(
          error?.message ||
            "Payment could not be started. Please refresh the page and try again."
        );
      }
    },
    [
      processing,
      user,
      cart,
      checkout,
      cartTotal,
      loadCart,
      loadPaystack,
      handlePaymentSuccess,
      handlePaymentClose,
    ]
  );


  /* =======================================================
     PROFILE SAVE
     ======================================================= */


  const saveProfile = useCallback(async () => {
    if (!user) return;


    const fullName = profile?.full_name?.trim() || "";
    const phone = profile?.phone?.trim() || "";


    if (!fullName || !phone) {
      showNotice("Please enter your full name and phone number.");
      return;
    }


    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email || "",
          full_name: fullName,
          phone,
        });


      if (error) throw error;


      await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone,
        },
      });


      setCheckout((previous) => ({
        ...previous,
        name: fullName,
        phone,
        email: user.email || previous.email,
      }));


      await loadProfile(user.id);


      showNotice("Profile updated successfully.");
    } catch (error) {
      console.error("Save profile:", error);
      showNotice("Could not update your profile.");
    }
  }, [user, profile, loadProfile, showNotice]);


  /* =======================================================
     FILTERED PRODUCTS
     ======================================================= */


  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();


    return products.filter((product) => {
      const matchesCategory = categoryMatches(product, category);


      const searchable = [
        product?.name,
        product?.description,
        product?.category,
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");


      const matchesSearch =
        !query || searchable.includes(query);


      return matchesCategory && matchesSearch;
    });
  }, [products, category, search]);


  /* =======================================================
     FORMAT DATE
     ======================================================= */


  const formatDate = useCallback((date) => {
    if (!date) return "—";


    try {
      return new Date(date).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return String(date);
    }
  }, []);


  /* =======================================================
     TRACKING STEP
     ======================================================= */


  const getTrackingStep = useCallback((order) => {
    const payment = String(
      order?.payment_status || "pending"
    ).toLowerCase();


    const status = String(
      order?.status || "pending"
    ).toLowerCase();


    if (payment !== "paid") return 0;


    if (
      ["pending", "paid", "confirmed"].includes(status)
    ) {
      return 1;
    }


    if (status === "processing") return 2;
    if (status === "shipped") return 3;
    if (status === "in_transit") return 3;
    if (status === "out_for_delivery") return 4;
    if (status === "delivered") return 5;


    return 2;
  }, []);


  /* =======================================================
     SCROLL
     ======================================================= */


  const scrollToSection = useCallback((id) => {
    setMobileMenu(false);


    setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }, []);


  /* =======================================================
     OPEN CHECKOUT
     ======================================================= */


  const openCheckout = useCallback(() => {
    if (!cart.length) {
      showNotice("Your bag is empty.");
      return;
    }


    setCheckoutError("");


    setCheckout((previous) => ({
      ...previous,
      name:
        previous.name ||
        profile?.full_name ||
        "",
      phone:
        previous.phone ||
        profile?.phone ||
        "",
      email:
        previous.email ||
        user?.email ||
        "",
    }));


    setModal("checkout");
  }, [cart.length, profile, user, showNotice]);


  /* =======================================================
     MODAL COMPONENT
     ======================================================= */


  const Modal = ({ children, onClose, wide = false }) => {
    return (
      <div
        className="modal-overlay"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !processing) {
            onClose();
          }
        }}
      >
        <div
          className={`modal ${wide ? "modal-wide" : ""}`}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <button
            className="modal-close"
            onClick={onClose}
            disabled={processing}
            aria-label="Close"
          >
            ×
          </button>


          {children}
        </div>
      </div>
    );
  };


  /* =======================================================
     LOADING SCREEN
     ======================================================= */


  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-mark">S</div>


        <div className="loading-brand">
          <strong>SHINDARA</strong>
          <span>PHONEFLAIR</span>
        </div>


        <div className="loading-line">
          <span />
        </div>


        <p>Preparing your shopping experience...</p>
      </div>
    );
  }


  /* =======================================================
     RENDER
     ======================================================= */


  return (
    <div className="app">

      {/* ===================================================
          ANNOUNCEMENT
          =================================================== */}

      <div className="announcement">
        <div className="announcement-track">
          <span>
            {siteSettings.tagline || "Premium phone accessories are screaming here."} · Nationwide delivery · Secure Paystack checkout
          </span>
          <span aria-hidden="true">
            {siteSettings.tagline || "Premium phone accessories are screaming here."} · Nationwide delivery · Secure Paystack checkout
          </span>
        </div>
      </div>

      {/* ===================================================
          HEADER
          =================================================== */}

      <header className="header">
        <button className="logo" onClick={() => scrollToSection("top")} aria-label="Shindara home">
          {siteSettings.logo_url ? (
            <img className="logo-image" src={siteSettings.logo_url} alt="Shindara PhoneFlair" />
          ) : (
            <span className="logo-symbol">◆</span>
          )}
          <span className="logo-copy">
            <strong>Shindara</strong>
            <small>PHONEFLAIR</small>
          </span>
        </button>

        <nav className={`nav ${mobileMenu ? "nav-open" : ""}`}>
          <button
            onClick={() => {
              setMobileMenu(false);
              scrollToSection("shop");
            }}
          >
            Shop
          </button>

          <button
            onClick={() => {
              setMobileMenu(false);
              scrollToSection("categories");
            }}
          >
            Categories
          </button>

          {user && (
            <button
              onClick={() => {
                setMobileMenu(false);
                setModal("orders");
              }}
            >
              Orders
            </button>
          )}
        </nav>

        <div className="header-actions">
          <button
            className="header-account"
            onClick={() => {
              if (user) {
                setModal("settings");
              } else {
                setAuthMode("login");
                resetAuthForm();
                setModal("auth");
              }
            }}
          >
            <span className="header-account-icon">{user ? "◉" : "↗"}</span>
            <span className="account-label">
              {user ? profile?.full_name?.split(" ")[0] || "Account" : "Sign in"}
            </span>
          </button>

          <button
            className="header-cart"
            onClick={() => {
              if (!user) {
                setAuthMode("login");
                setModal("auth");
                showNotice("Sign in to access your bag.");
                return;
              }
              setModal("cart");
            }}
            aria-label="Shopping bag"
          >
            <span>Bag</span>
            {cartCount > 0 && <b className="cart-count">{cartCount}</b>}
          </button>

          <button
            className="menu-button"
            onClick={() => setMobileMenu((value) => !value)}
            aria-label="Menu"
          >
            {mobileMenu ? "×" : "☰"}
          </button>
        </div>
      </header>

      <main>

        {/* =================================================
            HERO
            ================================================= */}

        <section className="hero" id="top">

          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />

          <div className="hero-copy">

            <div className="hero-eyebrow">
              <span className="hero-dot" />
              Shindara, with flair
            </div>

            <h1>
              Everyday tech, <em>elevated.</em>
            </h1>

            <p>
              Cases, chargers, cables and more, chosen for people who
              treat their setup like it matters. Add a little Shindara
              flair to the things you touch every day.
            </p>

            <div className="hero-buttons">
              <button className="btn-primary hero-btn" onClick={() => scrollToSection("shop")}>
                Shop the collection
                <span>→</span>
              </button>

              <button className="btn-text" onClick={() => scrollToSection("categories")}>
                Browse categories
              </button>
            </div>

            <div className="hero-trust">
              <span>Curated quality</span>
              <span>Nationwide delivery</span>
              <span>Secure checkout</span>
            </div>

          </div>

          <div className="hero-art">

            <div className="hero-card-back" />

            <div className="hero-card">
              <div className="hero-card-top">
                <span>SHINDARA</span>
                <span>PHONEFLAIR</span>
              </div>

              <div className="hero-card-center">
                <div className="hero-ring">
                  <div className="hero-ring-inner">S</div>
                </div>
                <strong>The everyday edit</strong>
                <span>BETTER ACCESSORIES</span>
              </div>

              <div className="hero-card-bottom">
                <span>SINCE DAY ONE</span>
                <span>✦</span>
              </div>
            </div>

            <div className="hero-floating hero-floating-one">
              <span>Handpicked</span>
              <strong>Premium builds</strong>
              <small>Not mass-market filler</small>
            </div>

            <div className="hero-floating hero-floating-two">
              <strong>Fast delivery</strong>
              <small>Across all 36 states</small>
            </div>

          </div>

        </section>

        {/* =================================================
            SERVICE STRIP
            ================================================= */}

        <section className="service-strip">
          <div>
            <span>◆</span>
            <strong>Premium quality</strong>
            <small>Products worth keeping.</small>
          </div>

          <div>
            <span>🔒</span>
            <strong>Secure checkout</strong>
            <small>Powered by Paystack.</small>
          </div>

          <div>
            <span>🚚</span>
            <strong>Nationwide delivery</strong>
            <small>We deliver across Nigeria.</small>
          </div>

          <div>
            <span>◎</span>
            <strong>Order tracking</strong>
            <small>Follow your order.</small>
          </div>
        </section>

        {/* =================================================
            CATEGORIES
            ================================================= */}

        <section className="categories-section" id="categories">

          <div className="section-heading">
            <div>
              <span className="section-kicker">Shop by category</span>
              <h2>Find your <em>essential.</em></h2>
            </div>

            <p>
              From everyday charging essentials to statement accessories,
              find something made for your setup.
            </p>
          </div>

          <div className="category-grid">
            {categories.map((item) => (
              <button
                className={`category-card ${category === item.name ? "active" : ""}`}
                key={item.name}
                onClick={() => {
                  setCategory(item.name);
                  scrollToSection("shop");
                }}
              >
                <span className="category-number">{item.icon || "◆"}</span>
                <span className="category-name">{item.name}</span>
                <span className="category-arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        {/* =================================================
            SHOP
            ================================================= */}

        <section className="shop-section" id="shop">

          <div className="shop-header">
            <div>
              <span className="section-kicker">The collection</span>
              <h2>Featured <em>products.</em></h2>
            </div>

            <div className="shop-tools">
              <div className="search-box">
                <span>⌕</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products..."
                />
                {search && (
                  <button onClick={() => setSearch("")} aria-label="Clear search">
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="filter-row">
            <button
              className={category === "All" ? "filter-chip active" : "filter-chip"}
              onClick={() => setCategory("All")}
            >
              All
            </button>
            {categories.map((item) => (
              <button
                key={item.name}
                className={category === item.name ? "filter-chip active" : "filter-chip"}
                onClick={() => setCategory(item.name)}
              >
                {item.name}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-shop">
              <div className="empty-shop-icon">⌕</div>
              <h3>No products found.</h3>
              <p>Try another search or choose a different category.</p>
              <button
                className="btn-secondary"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
              >
                View everything
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => {

                const stock = Number(product.stock || 0);
                const image = getProductImage(product);

                return (
                  <article className="product-card" key={product.id}>
                    <button
                      className="product-visual"
                      onClick={() => {
                        setSelectedProduct(product);
                        setModal("product");
                      }}
                    >
                      {image ? (
                        <img src={image} alt={product.name} loading="lazy" />
                      ) : (
                        <div className="product-placeholder">
                          <span>S</span>
                        </div>
                      )}

                      <span className="product-view">View</span>

                      {stock <= 0 && <span className="sold-out">Sold out</span>}
                      {stock > 0 && stock <= 5 && (
                        <span className="low-stock">Only {stock} left</span>
                      )}
                    </button>

                    <div className="product-content">
                      <span className="product-category">{product.category || "Shindara"}</span>
                      <h3>{product.name}</h3>
                      <p>{product.description || "Premium tech essential for everyday use."}</p>

                      <div className="product-footer">
                        <strong className="product-price">{money(product.price)}</strong>
                        <button
                          className="product-add"
                          disabled={stock <= 0}
                          onClick={() => addToCart(product)}
                        >
                          {stock <= 0 ? "Sold out" : "Add to bag"}
                          <span>+</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        </section>

        {/* =================================================
            BRAND CTA
            ================================================= */}

        <section className="brand-cta">
          <div className="brand-cta-pattern">SHINDARA · PHONEFLAIR · SHINDARA · PHONEFLAIR</div>

          <div className="brand-cta-content">
            <span className="section-kicker">Shindara Phoneflair</span>
            <h2>
              Better accessories.
              <br />
              <em>Better everyday.</em>
            </h2>
            <p>Your phone is part of your everyday life. Give it accessories that belong there.</p>
            <button className="btn-light" onClick={() => scrollToSection("shop")}>
              Shop now
            </button>
          </div>
        </section>

      </main>

      {/* ===================================================
          FOOTER
          =================================================== */}

      <footer className="footer">
        <div className="footer-main">

          <div className="footer-brand">
            <div className="footer-logo">
              {siteSettings.logo_url ? (
                <img className="logo-image" src={siteSettings.logo_url} alt="Shindara PhoneFlair" />
              ) : (
                <span>◆</span>
              )}
              <div>
                <strong>Shindara</strong>
                <small>PHONEFLAIR</small>
              </div>
            </div>
            <p>Premium phone accessories for people who care about the details.</p>
            <button className="footer-shop" onClick={() => scrollToSection("shop")}>
              Shop collection
            </button>
          </div>

          <div className="footer-column">
            <h4>Shop</h4>
            <button
              onClick={() => {
                setCategory("All");
                scrollToSection("shop");
              }}
            >
              All products
            </button>
            <button
              onClick={() => {
                setCategory("Phone Cases");
                scrollToSection("shop");
              }}
            >
              Phone Cases
            </button>
            <button
              onClick={() => {
                setCategory("Chargers");
                scrollToSection("shop");
              }}
            >
              Chargers
            </button>
            <button
              onClick={() => {
                setCategory("Power Banks");
                scrollToSection("shop");
              }}
            >
              Power Banks
            </button>
            <button
              onClick={() => {
                if (!user) {
                  setAuthMode("login");
                  setModal("auth");
                } else {
                  setModal("orders");
                }
              }}
            >
              My orders
            </button>
            <button
              onClick={() => {
                if (!user) {
                  setAuthMode("login");
                  setModal("auth");
                } else {
                  setModal("cart");
                }
              }}
            >
              My bag
            </button>
          </div>

          <div className="footer-column">
            <h4>Connect</h4>
            <button>Instagram</button>
            <button>TikTok</button>
            <button>Contact us</button>
          </div>

        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Shindara PhoneFlair</span>
          <span>Built for better everyday tech.</span>
        </div>
      </footer>

      {/* ===================================================
          PRODUCT MODAL
          =================================================== */}

      {modal === "product" && selectedProduct && (
        <Modal onClose={() => setModal(null)}>
          <div className="product-modal">
            <div className="product-modal-image">
              {getProductImage(selectedProduct) ? (
                <img src={getProductImage(selectedProduct)} alt={selectedProduct.name} />
              ) : (
                <div className="product-placeholder large">
                  <span>S</span>
                </div>
              )}
            </div>

            <div className="product-modal-content">
              <span className="modal-kicker">{selectedProduct.category || "Shindara product"}</span>
              <h2>{selectedProduct.name}</h2>
              <p className="product-modal-description">
                {selectedProduct.description || "Premium tech essential designed for everyday use."}
              </p>
              <div className="product-modal-price">{money(selectedProduct.price)}</div>

              <div className="product-modal-stock">
                <span>Availability</span>
                <strong>
                  {Number(selectedProduct.stock || 0) > 0
                    ? `${selectedProduct.stock} available`
                    : "Sold out"}
                </strong>
              </div>

              <button
                className="btn-primary full"
                disabled={Number(selectedProduct.stock || 0) <= 0}
                onClick={() => {
                  addToCart(selectedProduct);
                  setModal(null);
                }}
              >
                {Number(selectedProduct.stock || 0) > 0 ? "Add to bag" : "Sold out"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ===================================================
          AUTH MODAL
          =================================================== */}

      {modal === "auth" && (
        <Modal onClose={() => setModal(null)}>
          <div className="modal-head">
            <span className="modal-kicker">Shindara PhoneFlair</span>
            <h2>{authMode === "login" ? "Welcome back." : "Create your account."}</h2>
            <p>
              {authMode === "login"
                ? "Sign in to manage your bag and orders."
                : "Create an account to start shopping."}
            </p>
          </div>

          {authError && (
            <div className={`message ${/created|verification/i.test(authError) ? "success" : "error"}`}>
              {authError}
            </div>
          )}

          <button className="google-button" disabled={authLoading} onClick={handleGoogleLogin}>
            <span>G</span>
            Continue with Google
          </button>

          <div className="or-divider">
            <span />
            <b>or</b>
            <span />
          </div>

          <form onSubmit={handleAuth}>
            {authMode === "signup" && (
              <>
                <div className="field">
                  <label>Full name</label>
                  <input
                    value={authName}
                    onChange={(event) => setAuthName(event.target.value)}
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </div>

                <div className="field">
                  <label>Phone number</label>
                  <input
                    value={authPhone}
                    onChange={(event) => setAuthPhone(event.target.value)}
                    placeholder="08012345678"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>
              </>
            )}

            <div className="field">
              <label>Email address</label>
              <input
                type="email"
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                placeholder="At least 6 characters"
                autoComplete={authMode === "login" ? "current-password" : "new-password"}
              />
            </div>

            <button className="btn-primary full" type="submit" disabled={authLoading}>
              {authLoading ? "Please wait..." : authMode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            className="switch-auth"
            onClick={() => {
              setAuthMode(authMode === "login" ? "signup" : "login");
              setAuthError("");
            }}
          >
            {authMode === "login"
              ? "Don't have an account? Create one"
              : "Already have an account? Sign in"}
          </button>
        </Modal>
      )}

      {/* ===================================================
          CART MODAL
          =================================================== */}

      {modal === "cart" && (
        <Modal onClose={() => setModal(null)} wide>
          <div className="modal-head">
            <span className="modal-kicker">Your bag</span>
            <h2>Shopping bag.</h2>
            <p>
              {cartCount} item{cartCount !== 1 ? "s" : ""} selected.
            </p>
          </div>

          {cartLoading ? (
            <div className="modal-empty">
              <div className="mini-spinner" />
              <p>Loading your bag...</p>
            </div>
          ) : cart.length === 0 ? (
            <div className="modal-empty">
              <div className="empty-bag">🛍</div>
              <h3>Your bag is empty.</h3>
              <p>Find something you love and add it here.</p>
              <button
                className="btn-primary"
                onClick={() => {
                  setModal(null);
                  scrollToSection("shop");
                }}
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              <div className="cart-list">
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item-image">
                      {getProductImage(item.product) ? (
                        <img src={getProductImage(item.product)} alt={item.product?.name || ""} />
                      ) : (
                        <span>S</span>
                      )}
                    </div>

                    <div className="cart-item-info">
                      <span>{item.product?.category || "Shindara"}</span>
                      <h4>{item.product?.name}</h4>
                      <strong>{money(item.product?.price)}</strong>
                    </div>

                    <div className="cart-item-controls">
                      <div className="quantity">
                        <button onClick={() => updateQuantity(item, -1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item, 1)}>+</button>
                      </div>

                      <strong>{money(item.subtotal)}</strong>

                      <button className="remove" onClick={() => removeFromCart(item)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div>
                  <span>Items</span>
                  <strong>{cartCount}</strong>
                </div>
                <div className="cart-grand-total">
                  <span>Total</span>
                  <strong>{money(cartTotal)}</strong>
                </div>
              </div>

              <button className="btn-primary full" onClick={openCheckout}>
                Continue to checkout
              </button>

              <p className="checkout-note">🔒 Secure payment powered by Paystack</p>
            </>
          )}
        </Modal>
      )}

      {/* ===================================================
          CHECKOUT MODAL
          =================================================== */}

      {modal === "checkout" && (
        <Modal
          onClose={() => {
            if (!processing) {
              setModal("cart");
            }
          }}
          wide
        >
          <div className="modal-head">
            <span className="modal-kicker">Secure checkout</span>
            <h2>Where should we deliver?</h2>
            <p>Enter your details below and complete payment securely.</p>
          </div>

          {checkoutError && (
            <div className={`message ${/successful|confirmed/i.test(checkoutError) ? "success" : "error"}`}>
              {checkoutError}
            </div>
          )}

          <form onSubmit={handlePayment}>
            <div className="checkout-section-title">
              <span>1</span>
              Customer details
            </div>

            <div className="checkout-grid">
              <div className="field">
                <label>Full name</label>
                <input
                  value={checkout.name}
                  onChange={(event) =>
                    setCheckout((previous) => ({ ...previous, name: event.target.value }))
                  }
                  placeholder="Your full name"
                  required
                  disabled={processing}
                />
              </div>

              <div className="field">
                <label>Phone number</label>
                <input
                  value={checkout.phone}
                  onChange={(event) =>
                    setCheckout((previous) => ({ ...previous, phone: event.target.value }))
                  }
                  placeholder="08012345678"
                  inputMode="tel"
                  required
                  disabled={processing}
                />
              </div>

              <div className="field field-full">
                <label>Email address</label>
                <input
                  type="email"
                  value={checkout.email}
                  onChange={(event) =>
                    setCheckout((previous) => ({ ...previous, email: event.target.value }))
                  }
                  placeholder="you@example.com"
                  required
                  disabled={processing}
                />
              </div>
            </div>

            <div className="checkout-section-title">
              <span>2</span>
              Delivery location
            </div>

            <div className="checkout-grid">
              <div className="field">
                <label>State</label>
                <select
                  value={checkout.state}
                  onChange={(event) =>
                    setCheckout((previous) => ({
                      ...previous,
                      state: event.target.value,
                      city: "",
                    }))
                  }
                  required
                  disabled={processing}
                >
                  <option value="">Select your state</option>
                  {Object.keys(NIGERIA_LOCATIONS)
                    .sort((a, b) => a.localeCompare(b))
                    .map((state) => (
                      <option value={state} key={state}>
                        {state}
                      </option>
                    ))}
                </select>
              </div>

              <div className="field">
                <label>City / LGA</label>
                <select
                  value={checkout.city}
                  onChange={(event) =>
                    setCheckout((previous) => ({ ...previous, city: event.target.value }))
                  }
                  required
                  disabled={processing || !checkout.state}
                >
                  <option value="">
                    {checkout.state ? "Select city / LGA" : "Select state first"}
                  </option>
                  {(NIGERIA_LOCATIONS[checkout.state] || [])
                    .slice()
                    .sort((a, b) => a.localeCompare(b))
                    .map((city) => (
                      <option value={city} key={city}>
                        {city}
                      </option>
                    ))}
                </select>
              </div>

              <div className="field field-full">
                <label>Full delivery address</label>
                <textarea
                  value={checkout.address}
                  onChange={(event) =>
                    setCheckout((previous) => ({ ...previous, address: event.target.value }))
                  }
                  placeholder="House number, street name, landmark..."
                  rows="3"
                  required
                  disabled={processing}
                />
              </div>
            </div>

            <div className="checkout-section-title">
              <span>3</span>
              Order summary
            </div>

            <div className="checkout-summary">
              {cart.map((item) => (
                <div key={item.id}>
                  <span>
                    {item.product?.name} × {item.quantity}
                  </span>
                  <strong>{money(item.subtotal)}</strong>
                </div>
              ))}

              <div className="checkout-total">
                <span>Total to pay</span>
                <strong>{money(cartTotal)}</strong>
              </div>
            </div>

            <button className="btn-primary full pay-button" type="submit" disabled={processing}>
              {processing ? "Opening secure payment..." : `Pay ${money(cartTotal)}`}
            </button>

            <div className="payment-security">
              <span>🔒</span>
              <div>
                <strong>Secure payment</strong>
                <small>Your payment is securely processed by Paystack.</small>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ===================================================
          ORDERS MODAL
          =================================================== */}

      {modal === "orders" && (
        <Modal onClose={() => setModal(null)} wide>
          <div className="modal-head">
            <span className="modal-kicker">Your account</span>
            <h2>Your orders.</h2>
            <p>Track every Shindara purchase from payment to delivery.</p>
          </div>

          {orders.length === 0 ? (
            <div className="modal-empty">
              <div className="empty-bag">📦</div>
              <h3>No orders yet.</h3>
              <p>Your completed purchases will appear here.</p>
              <button
                className="btn-primary"
                onClick={() => {
                  setModal(null);
                  scrollToSection("shop");
                }}
              >
                Start shopping
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <button
                  className="order-card"
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setModal("tracking");
                  }}
                >
                  <div className="order-card-main">
                    <span>{formatDate(order.created_at)}</span>
                    <h3>
                      {order.tracking_number || `Order #${String(order.id).slice(0, 8)}`}
                    </h3>
                    <p>
                      {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}{" "}
                      · {money(order.total)}
                    </p>
                  </div>

                  <div className="order-card-status">
                    <span
                      className={
                        String(order.payment_status).toLowerCase() === "paid"
                          ? "status-paid"
                          : "status-pending"
                      }
                    >
                      {String(order.payment_status || "pending").toUpperCase()}
                    </span>
                    <strong>→</strong>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* ===================================================
          TRACKING MODAL
          =================================================== */}

      {modal === "tracking" && selectedOrder && (
        <Modal onClose={() => setModal("orders")} wide>
          <div className="modal-head">
            <span className="modal-kicker">Order tracking</span>
            <h2>{selectedOrder.tracking_number || "Order"}</h2>
            <p>Keep this tracking number for your delivery reference.</p>
          </div>

          <div className="tracking-overview">
            <div>
              <span>Payment</span>
              <strong>{String(selectedOrder.payment_status || "pending").toUpperCase()}</strong>
            </div>

            <div>
              <span>Order status</span>
              <strong>
                {String(selectedOrder.status || "pending").replace(/_/g, " ").toUpperCase()}
              </strong>
            </div>

            <div>
              <span>Order date</span>
              <strong>{formatDate(selectedOrder.created_at)}</strong>
            </div>

            <div>
              <span>Payment reference</span>
              <strong className="reference">{selectedOrder.payment_reference || "—"}</strong>
            </div>
          </div>

          <div className="tracking-timeline">
            {[
              ["Order placed", "We've received your order."],
              ["Payment confirmed", "Your payment has been confirmed."],
              ["Processing", "Your items are being prepared."],
              ["Shipped", "Your order is on the way."],
              ["Out for delivery", "Your delivery is almost there."],
              ["Delivered", "Your order has arrived."],
            ].map(([title, description], index) => {

              const step = getTrackingStep(selectedOrder);
              const completed = index <= step;

              return (
                <div className={`timeline-item ${completed ? "completed" : ""}`} key={title}>
                  <div className="timeline-marker">{completed ? "✓" : index + 1}</div>
                  <div className="timeline-copy">
                    <h4>{title}</h4>
                    <p>{description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="tracking-items">
            <div className="tracking-section-title">Items in this order</div>

            {(selectedOrder.items || []).map((item) => (
              <div
                className="tracking-item"
                key={item.id || `${item.product_id}-${item.quantity}`}
              >
                <div>
                  <strong>{item.products?.name || item.product?.name || "Product"}</strong>
                  <span>
                    Qty {item.quantity} × {money(item.price)}
                  </span>
                </div>
                <strong>{money(Number(item.price || 0) * Number(item.quantity || 0))}</strong>
              </div>
            ))}
          </div>

          <div className="tracking-grand-total">
            <span>Total paid</span>
            <strong>{money(selectedOrder.total)}</strong>
          </div>

          <div className="delivery-card">
            <div className="tracking-section-title">Delivery address</div>
            <strong>{selectedOrder.customer_name || "—"}</strong>
            <span>{selectedOrder.customer_phone || "—"}</span>
            <span>{selectedOrder.delivery_address || "—"}</span>
            <span>
              {selectedOrder.delivery_city || "—"}, {selectedOrder.delivery_state || "—"}
            </span>
          </div>
        </Modal>
      )}

      {/* ===================================================
          SETTINGS MODAL
          =================================================== */}

      {modal === "settings" && user && (
        <Modal onClose={() => setModal(null)}>
          <div className="modal-head">
            <span className="modal-kicker">Your account</span>
            <h2>Account settings.</h2>
            <p>Update your details for faster checkout.</p>
          </div>

          <div className="profile-avatar">
            {(profile?.full_name || user.email || "S").charAt(0).toUpperCase()}
          </div>

          <div className="field">
            <label>Email</label>
            <input value={user.email || ""} readOnly />
          </div>

          <div className="field">
            <label>Full name</label>
            <input
              value={profile?.full_name || ""}
              onChange={(event) =>
                setProfile((previous) => ({ ...(previous || {}), full_name: event.target.value }))
              }
              placeholder="Your full name"
            />
          </div>

          <div className="field">
            <label>Phone number</label>
            <input
              value={profile?.phone || ""}
              onChange={(event) =>
                setProfile((previous) => ({ ...(previous || {}), phone: event.target.value }))
              }
              placeholder="08012345678"
              inputMode="tel"
            />
          </div>

          <button className="btn-primary full" onClick={saveProfile}>
            Save profile
          </button>

          <div className="settings-block">
            <div className="settings-block-title">Appearance</div>

            <div className="appearance-switch">
              <button
                className={theme === "light" ? "active" : ""}
                onClick={() => setTheme("light")}
              >
                ☀ Light
              </button>

              <button
                className={theme === "dark" ? "active" : ""}
                onClick={() => setTheme("dark")}
              >
                ◐ Dark
              </button>
            </div>
          </div>

          <button className="btn-secondary full" onClick={() => setModal("orders")}>
            View my orders
          </button>

          <button className="logout-button" onClick={logout}>
            Sign out
          </button>
        </Modal>
      )}

      {/* ===================================================
          NOTICE
          =================================================== */}

      {notice && (
        <div className="toast">
          <span>✓</span>
          <p>{notice}</p>
        </div>
      )}

    </div>
  );
}
