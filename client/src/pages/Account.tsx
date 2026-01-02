import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Shield, Eye, EyeOff, Mail, Calendar, CheckCircle2, AlertCircle, Lock, Trash2, User, Bell, Smartphone, MapPin, Clock, Download, LogOut } from 'lucide-react';

const roleColors: Record<string, { bg: string; color: string }> = {
  student: { bg: 'hsl(174, 62%, 47%)', color: '#ffffff' },
  lecturer: { bg: 'hsl(38, 92%, 50%)', color: '#ffffff' },
  admin: { bg: 'hsl(280, 65%, 50%)', color: '#ffffff' },
};

const COUNTRY_CODES = [
  { code: '+93', country: 'Afghanistan' },
  { code: '+358', country: 'Åland Islands' },
  { code: '+355', country: 'Albania' },
  { code: '+213', country: 'Algeria' },
  { code: '+1', country: 'American Samoa' },
  { code: '+376', country: 'Andorra' },
  { code: '+244', country: 'Angola' },
  { code: '+1', country: 'Anguilla' },
  { code: '+1', country: 'Antigua and Barbuda' },
  { code: '+54', country: 'Argentina' },
  { code: '+374', country: 'Armenia' },
  { code: '+297', country: 'Aruba' },
  { code: '+61', country: 'Australia' },
  { code: '+43', country: 'Austria' },
  { code: '+994', country: 'Azerbaijan' },
  { code: '+1', country: 'Bahamas' },
  { code: '+973', country: 'Bahrain' },
  { code: '+880', country: 'Bangladesh' },
  { code: '+1', country: 'Barbados' },
  { code: '+375', country: 'Belarus' },
  { code: '+32', country: 'Belgium' },
  { code: '+501', country: 'Belize' },
  { code: '+229', country: 'Benin' },
  { code: '+1', country: 'Bermuda' },
  { code: '+975', country: 'Bhutan' },
  { code: '+591', country: 'Bolivia' },
  { code: '+387', country: 'Bosnia and Herzegovina' },
  { code: '+267', country: 'Botswana' },
  { code: '+55', country: 'Brazil' },
  { code: '+246', country: 'British Indian Ocean Territory' },
  { code: '+673', country: 'Brunei' },
  { code: '+359', country: 'Bulgaria' },
  { code: '+226', country: 'Burkina Faso' },
  { code: '+257', country: 'Burundi' },
  { code: '+855', country: 'Cambodia' },
  { code: '+237', country: 'Cameroon' },
  { code: '+1', country: 'Canada' },
  { code: '+238', country: 'Cape Verde' },
  { code: '+1', country: 'Cayman Islands' },
  { code: '+236', country: 'Central African Republic' },
  { code: '+235', country: 'Chad' },
  { code: '+56', country: 'Chile' },
  { code: '+86', country: 'China' },
  { code: '+886', country: 'Taiwan' },
  { code: '+57', country: 'Colombia' },
  { code: '+269', country: 'Comoros' },
  { code: '+242', country: 'Congo' },
  { code: '+243', country: 'Democratic Republic of the Congo' },
  { code: '+682', country: 'Cook Islands' },
  { code: '+506', country: 'Costa Rica' },
  { code: '+385', country: 'Croatia' },
  { code: '+53', country: 'Cuba' },
  { code: '+357', country: 'Cyprus' },
  { code: '+420', country: 'Czech Republic' },
  { code: '+45', country: 'Denmark' },
  { code: '+253', country: 'Djibouti' },
  { code: '+1', country: 'Dominica' },
  { code: '+1', country: 'Dominican Republic' },
  { code: '+593', country: 'Ecuador' },
  { code: '+20', country: 'Egypt' },
  { code: '+503', country: 'El Salvador' },
  { code: '+240', country: 'Equatorial Guinea' },
  { code: '+291', country: 'Eritrea' },
  { code: '+372', country: 'Estonia' },
  { code: '+251', country: 'Ethiopia' },
  { code: '+298', country: 'Faroe Islands' },
  { code: '+679', country: 'Fiji' },
  { code: '+358', country: 'Finland' },
  { code: '+33', country: 'France' },
  { code: '+594', country: 'French Guiana' },
  { code: '+689', country: 'French Polynesia' },
  { code: '+241', country: 'Gabon' },
  { code: '+220', country: 'Gambia' },
  { code: '+995', country: 'Georgia' },
  { code: '+49', country: 'Germany' },
  { code: '+233', country: 'Ghana' },
  { code: '+350', country: 'Gibraltar' },
  { code: '+30', country: 'Greece' },
  { code: '+299', country: 'Greenland' },
  { code: '+1', country: 'Grenada' },
  { code: '+590', country: 'Guadeloupe' },
  { code: '+1', country: 'Guam' },
  { code: '+502', country: 'Guatemala' },
  { code: '+44', country: 'Guernsey' },
  { code: '+224', country: 'Guinea' },
  { code: '+245', country: 'Guinea-Bissau' },
  { code: '+592', country: 'Guyana' },
  { code: '+509', country: 'Haiti' },
  { code: '+504', country: 'Honduras' },
  { code: '+852', country: 'Hong Kong' },
  { code: '+36', country: 'Hungary' },
  { code: '+354', country: 'Iceland' },
  { code: '+91', country: 'India' },
  { code: '+62', country: 'Indonesia' },
  { code: '+98', country: 'Iran' },
  { code: '+964', country: 'Iraq' },
  { code: '+353', country: 'Ireland' },
  { code: '+44', country: 'Isle of Man' },
  { code: '+972', country: 'Israel' },
  { code: '+39', country: 'Italy' },
  { code: '+1', country: 'Ivory Coast' },
  { code: '+1', country: 'Jamaica' },
  { code: '+81', country: 'Japan' },
  { code: '+44', country: 'Jersey' },
  { code: '+962', country: 'Jordan' },
  { code: '+7', country: 'Kazakhstan' },
  { code: '+254', country: 'Kenya' },
  { code: '+686', country: 'Kiribati' },
  { code: '+850', country: 'North Korea' },
  { code: '+82', country: 'South Korea' },
  { code: '+965', country: 'Kuwait' },
  { code: '+996', country: 'Kyrgyzstan' },
  { code: '+856', country: 'Laos' },
  { code: '+371', country: 'Latvia' },
  { code: '+961', country: 'Lebanon' },
  { code: '+266', country: 'Lesotho' },
  { code: '+231', country: 'Liberia' },
  { code: '+218', country: 'Libya' },
  { code: '+423', country: 'Liechtenstein' },
  { code: '+370', country: 'Lithuania' },
  { code: '+352', country: 'Luxembourg' },
  { code: '+853', country: 'Macao' },
  { code: '+389', country: 'Macedonia' },
  { code: '+261', country: 'Madagascar' },
  { code: '+265', country: 'Malawi' },
  { code: '+60', country: 'Malaysia' },
  { code: '+960', country: 'Maldives' },
  { code: '+223', country: 'Mali' },
  { code: '+356', country: 'Malta' },
  { code: '+692', country: 'Marshall Islands' },
  { code: '+596', country: 'Martinique' },
  { code: '+222', country: 'Mauritania' },
  { code: '+230', country: 'Mauritius' },
  { code: '+262', country: 'Mayotte' },
  { code: '+52', country: 'Mexico' },
  { code: '+691', country: 'Micronesia' },
  { code: '+373', country: 'Moldova' },
  { code: '+377', country: 'Monaco' },
  { code: '+976', country: 'Mongolia' },
  { code: '+382', country: 'Montenegro' },
  { code: '+1', country: 'Montserrat' },
  { code: '+212', country: 'Morocco' },
  { code: '+258', country: 'Mozambique' },
  { code: '+95', country: 'Myanmar' },
  { code: '+264', country: 'Namibia' },
  { code: '+674', country: 'Nauru' },
  { code: '+977', country: 'Nepal' },
  { code: '+31', country: 'Netherlands' },
  { code: '+599', country: 'Netherlands Antilles' },
  { code: '+687', country: 'New Caledonia' },
  { code: '+64', country: 'New Zealand' },
  { code: '+505', country: 'Nicaragua' },
  { code: '+227', country: 'Niger' },
  { code: '+234', country: 'Nigeria' },
  { code: '+683', country: 'Niue' },
  { code: '+672', country: 'Norfolk Island' },
  { code: '+1', country: 'Northern Mariana Islands' },
  { code: '+47', country: 'Norway' },
  { code: '+968', country: 'Oman' },
  { code: '+92', country: 'Pakistan' },
  { code: '+680', country: 'Palau' },
  { code: '+970', country: 'Palestine' },
  { code: '+507', country: 'Panama' },
  { code: '+675', country: 'Papua New Guinea' },
  { code: '+595', country: 'Paraguay' },
  { code: '+51', country: 'Peru' },
  { code: '+63', country: 'Philippines' },
  { code: '+48', country: 'Poland' },
  { code: '+351', country: 'Portugal' },
  { code: '+1', country: 'Puerto Rico' },
  { code: '+974', country: 'Qatar' },
  { code: '+262', country: 'Réunion' },
  { code: '+40', country: 'Romania' },
  { code: '+7', country: 'Russia' },
  { code: '+250', country: 'Rwanda' },
  { code: '+590', country: 'Saint Barthélemy' },
  { code: '+1', country: 'Saint Kitts and Nevis' },
  { code: '+1', country: 'Saint Lucia' },
  { code: '+590', country: 'Saint Martin' },
  { code: '+508', country: 'Saint Pierre and Miquelon' },
  { code: '+1', country: 'Saint Vincent and the Grenadines' },
  { code: '+685', country: 'Samoa' },
  { code: '+378', country: 'San Marino' },
  { code: '+239', country: 'São Tomé and Príncipe' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+221', country: 'Senegal' },
  { code: '+381', country: 'Serbia' },
  { code: '+248', country: 'Seychelles' },
  { code: '+232', country: 'Sierra Leone' },
  { code: '+65', country: 'Singapore' },
  { code: '+421', country: 'Slovakia' },
  { code: '+386', country: 'Slovenia' },
  { code: '+677', country: 'Solomon Islands' },
  { code: '+252', country: 'Somalia' },
  { code: '+27', country: 'South Africa' },
  { code: '+211', country: 'South Sudan' },
  { code: '+34', country: 'Spain' },
  { code: '+94', country: 'Sri Lanka' },
  { code: '+249', country: 'Sudan' },
  { code: '+597', country: 'Suriname' },
  { code: '+268', country: 'Eswatini' },
  { code: '+46', country: 'Sweden' },
  { code: '+41', country: 'Switzerland' },
  { code: '+963', country: 'Syria' },
  { code: '+886', country: 'Taiwan' },
  { code: '+992', country: 'Tajikistan' },
  { code: '+255', country: 'Tanzania' },
  { code: '+66', country: 'Thailand' },
  { code: '+670', country: 'Timor-Leste' },
  { code: '+228', country: 'Togo' },
  { code: '+690', country: 'Tokelau' },
  { code: '+676', country: 'Tonga' },
  { code: '+1', country: 'Trinidad and Tobago' },
  { code: '+216', country: 'Tunisia' },
  { code: '+90', country: 'Turkey' },
  { code: '+993', country: 'Turkmenistan' },
  { code: '+1', country: 'Turks and Caicos Islands' },
  { code: '+688', country: 'Tuvalu' },
  { code: '+256', country: 'Uganda' },
  { code: '+380', country: 'Ukraine' },
  { code: '+971', country: 'United Arab Emirates' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+1', country: 'United States' },
  { code: '+598', country: 'Uruguay' },
  { code: '+998', country: 'Uzbekistan' },
  { code: '+678', country: 'Vanuatu' },
  { code: '+39', country: 'Vatican City' },
  { code: '+58', country: 'Venezuela' },
  { code: '+84', country: 'Vietnam' },
  { code: '+1', country: 'Virgin Islands (British)' },
  { code: '+1', country: 'Virgin Islands (US)' },
  { code: '+681', country: 'Wallis and Futuna' },
  { code: '+967', country: 'Yemen' },
  { code: '+260', country: 'Zambia' },
  { code: '+263', country: 'Zimbabwe' },
];

// Helper function to get country code from country name
const getCountryCodeByName = (countryName: string): string => {
  const found = COUNTRY_CODES.find(item => item.country === countryName);
  return found ? found.code : '+1';
};

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'Afghanistan': ['Kabul', 'Kandahar', 'Herat', 'Mazar-i-Sharif', 'Jalalabad', 'Balkh', 'Logar', 'Paktia'],
  'Albania': ['Tirana', 'Durrës', 'Vlorë', 'Shkodër', 'Elbasan', 'Fier', 'Korçë', 'Berat'],
  'Algeria': ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Sétif', 'Tlemcen'],
  'Andorra': ['Andorra la Vella', 'Escaldes-Engordany', 'Encamp', 'La Massana', 'Ordino', 'Canillo', 'Sant Julià de Lòria'],
  'Angola': ['Luanda', 'Huambo', 'Benguela', 'Lobito', 'Kuito', 'Malanje', 'Cabinda', 'Sumbe'],
  'Argentina': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Tucumán', 'Mar del Plata', 'Salta'],
  'Armenia': ['Yerevan', 'Giumri', 'Vagharshapat', 'Vanadzor', 'Abovyan', 'Alaverdi', 'Armavir', 'Ararat'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra'],
  'Austria': ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels'],
  'Azerbaijan': ['Baku', 'Ganja', 'Sumqayit', 'Quba', 'Shaki', 'Shirvan', 'Mingachevir', 'Lankaran'],
  'Bahamas': ['Nassau', 'Freeport', 'Lucaya', 'West End', 'Coopers Town', 'Andros Town', 'Staniel Cay'],
  'Bahrain': ['Manama', 'Muharraq', 'Hamad Town', 'Isa Town', 'Riffa', 'Al Jasra', 'Jidd Hafs', 'Sitra'],
  'Bangladesh': ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Barisal', 'Mymensingh', 'Narayanganj'],
  'Barbados': ['Bridgetown', 'Speightstown', 'Oistins', 'Bathsheba', 'Holetown', 'Saint John', 'Crane'],
  'Belarus': ['Minsk', 'Brest', 'Grodno', 'Vitebsk', 'Mogilev', 'Gomel', 'Pinsk', 'Orsha'],
  'Belgium': ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Leuven'],
  'Belize': ['Belize City', 'San Ignacio', 'Orange Walk', 'Dangriga', 'Toledo', 'Caye Caulker', 'San Pedro'],
  'Benin': ['Cotonou', 'Porto-Novo', 'Abomey', 'Parakou', 'Djougou', 'Ouidah', 'Lokoja', 'Kandi'],
  'Bermuda': ['Hamilton', 'Saint George', 'Dockyard', 'Warwick', 'Somerset', 'Devonshire', 'Pembroke'],
  'Bhutan': ['Thimphu', 'Paro', 'Punakha', 'Jakar', 'Trongsa', 'Mongar', 'Bumthang', 'Haa'],
  'Bolivia': ['La Paz', 'Santa Cruz', 'Cochabamba', 'Oruro', 'Sucre', 'Potosí', 'Tarija', 'Trinidad'],
  'Bosnia and Herzegovina': ['Sarajevo', 'Banja Luka', 'Zenica', 'Tuzla', 'Mostar', 'Prijedor', 'Visoko'],
  'Botswana': ['Gaborone', 'Francistown', 'Molepolole', 'Selebi-Phikwe', 'Maun', 'Kasane', 'Serowe', 'Jwaneng'],
  'Brazil': ['São Paulo', 'Rio de Janeiro', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Brasília', 'Manaus', 'Curitiba'],
  'Brunei': ['Bandar Seri Begawan', 'Kuala Belait', 'Tutong', 'Seria', 'Temburong', 'Ribuan'],
  'Bulgaria': ['Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven', 'Sliven'],
  'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Banfora', 'Dédougou', 'Kaya'],
  'Burundi': ['Gitega', 'Bujumbura', 'Ngozi', 'Muyinga', 'Ruyigi', 'Bururi', 'Cankuzo', 'Muramvya'],
  'Cambodia': ['Phnom Penh', 'Battambang', 'Siem Reap', 'Kompong Cham', 'Takéo', 'Kampong Thom', 'Pursat'],
  'Cameroon': ['Yaoundé', 'Douala', 'Garoua', 'Bamenda', 'Kumba', 'Bafoussam', 'Limbé', 'Buea'],
  'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City'],
  'Cape Verde': ['Praia', 'Mindelo', 'Tarrafal', 'Santa Maria', 'Ribeira Brava', 'Mosteirós', 'Pedra Lume'],
  'Central African Republic': ['Bangui', 'Bambari', 'Bimbo', 'Carnot', 'Berberati', 'Mobaye', 'Kaga-Bandoro'],
  'Chad': ['N\'Djamena', 'Abeché', 'Sarh', 'Moundou', 'Dosso', 'Bongor', 'Guelendeng', 'Kousseri'],
  'Chile': ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Temuco', 'Valdivia', 'Puerto Montt', 'Antofagasta'],
  'China': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Xi\'an', 'Tianjin'],
  'Colombia': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Bucaramanga', 'Santa Marta'],
  'Comoros': ['Moroni', 'Mutsamudu', 'Fomboni', 'Ouani', 'Sima', 'Mitsoudje', 'Bandrani'],
  'Congo': ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Loubomo', 'Impfondo', 'Owando'],
  'Costa Rica': ['San José', 'Alajuela', 'Cartago', 'Puntarenas', 'Liberia', 'San Isidro', 'Limón', 'Heredia'],
  'Croatia': ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula', 'Varaždin', 'Sisak'],
  'Cuba': ['Havana', 'Santiago de Cuba', 'Camagüey', 'Holguín', 'Guantánamo', 'Santa Clara', 'Matanzas'],
  'Cyprus': ['Nicosia', 'Limassol', 'Larnaca', 'Paphos', 'Famagusta', 'Morphou', 'Kyrenia', 'Akrotiri'],
  'Czech Republic': ['Prague', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Ústí nad Labem', 'Hradec Králové', 'Pardubice'],
  'Denmark': ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Randers', 'Kolding', 'Vejle'],
  'Djibouti': ['Djibouti City', 'Ali Sabieh', 'Arta', 'Dikhil', 'Obock', 'Tadjourah', 'Bab el Mandeb'],
  'Dominican Republic': ['Santo Domingo', 'Santiago de los Caballeros', 'La Romana', 'San Francisco de Macorís', 'San Cristóbal', 'Puerto Plata'],
  'Ecuador': ['Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Ambato', 'Manta', 'Portoviejo', 'Riobamba'],
  'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Helwan', 'Port Said', 'Suez', 'Luxor', 'Aswan'],
  'El Salvador': ['San Salvador', 'Santa Ana', 'San Miguel', 'Nueva San Salvador', 'Soyapango', 'Cojutepeque', 'Zacatecoluca'],
  'Equatorial Guinea': ['Malabo', 'Bata', 'Ebebiyin', 'Luba', 'Evinayong', 'Riaba', 'Añisok'],
  'Eritrea': ['Asmara', 'Keren', 'Massawa', 'Assab', 'Dekemhare', 'Akordwa', 'Adi Keih'],
  'Estonia': ['Tallinn', 'Tartu', 'Narva', 'Kohtla-Järve', 'Pärnu', 'Rakvere', 'Viljandi'],
  'Ethiopia': ['Addis Ababa', 'Dire Dawa', 'Adama', 'Awassa', 'Mekelle', 'Bahir Dar', 'Jimma', 'Arba Minch'],
  'Fiji': ['Suva', 'Nadi', 'Lautoka', 'Labasa', 'Nausori', 'Sigatoka', 'Ba', 'Navua'],
  'Finland': ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Turku', 'Oulu', 'Lahti', 'Kuopio'],
  'France': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier'],
  'Gabon': ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Ntoum', 'Lambaréné'],
  'Gambia': ['Banjul', 'Serekunda', 'Brikama', 'Lamin', 'Farafenni', 'Kaolack', 'Kuntaur'],
  'Georgia': ['Tbilisi', 'Kutaisi', 'Batumi', 'Gori', 'Zugdidi', 'Telavi', 'Samtredia', 'Dusheti'],
  'Germany': ['Berlin', 'Munich', 'Cologne', 'Frankfurt', 'Hamburg', 'Düsseldorf', 'Dortmund', 'Essen'],
  'Ghana': ['Accra', 'Kumasi', 'Tamale', 'Sekondi-Takoradi', 'Cape Coast', 'Tema', 'Koforidua'],
  'Gibraltar': ['Gibraltar'],
  'Greece': ['Athens', 'Thessaloniki', 'Patras', 'Larissa', 'Heraklion', 'Volos', 'Ioannina', 'Rethymno'],
  'Grenada': ['Saint George\'s', 'Grenville', 'Gouyave', 'Victoria', 'Sauteurs', 'Tivoli'],
  'Guatemala': ['Guatemala City', 'Quetzaltenango', 'Escuintla', 'Mixco', 'Villa Nueva', 'Petapa', 'San Juan Sacatepéquez'],
  'Guinea': ['Conakry', 'Kindia', 'Mamou', 'Kankan', 'Labé', 'Faranah', 'Kissidougou'],
  'Guinea-Bissau': ['Bissau', 'Bafatá', 'Gabu', 'Cacheu', 'Canchungo', 'Mansoa', 'Oio'],
  'Guyana': ['Georgetown', 'Linden', 'New Amsterdam', 'Bartica', 'Corriverton', 'Mahaica', 'Mabaruma'],
  'Haiti': ['Port-au-Prince', 'Cap-Haïtien', 'Gonaïves', 'Les Cayes', 'Port-de-Paix', 'Jacmel', 'Hinche'],
  'Honduras': ['Tegucigalpa', 'San Pedro Sula', 'Choloma', 'La Ceiba', 'Comayagua', 'El Progreso', 'Roatán'],
  'Hong Kong': ['Hong Kong', 'Kowloon', 'New Territories', 'Victoria', 'Mong Kok', 'Causeway Bay', 'Central'],
  'Hungary': ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 'Győr', 'Nyíregyháza', 'Kecskemét'],
  'Iceland': ['Reykjavik', 'Kópavogur', 'Hafnarfjörður', 'Akureyri', 'Reykjanesbær', 'Garðabær', 'Mosfellsbær'],
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'],
  'Indonesia': ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Bogor'],
  'Iran': ['Tehran', 'Mashhad', 'Isfahan', 'Karaj', 'Tabriz', 'Shiraz', 'Qom', 'Ahvaz'],
  'Iraq': ['Baghdad', 'Basra', 'Mosul', 'Erbil', 'Najaf', 'Karbala', 'Kirkuk', 'Sulaymaniyah'],
  'Ireland': ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford', 'Drogheda', 'Dundalk', 'Dun Laoghaire'],
  'Israel': ['Jerusalem', 'Tel Aviv', 'Haifa', 'Rishon LeZion', 'Petah Tikva', 'Beersheba', 'Ramat Gan', 'Netanya'],
  'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence'],
  'Jamaica': ['Kingston', 'Montego Bay', 'Spanish Town', 'Portmore', 'Mandeville', 'Runaway Bay', 'Ocho Rios'],
  'Japan': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto'],
  'Jordan': ['Amman', 'Zarqa', 'Irbid', 'Russeifa', 'Salt', 'Madaba', 'Aqaba', 'Jerash'],
  'Kazakhstan': ['Almaty', 'Nur-Sultan', 'Karaganda', 'Shymkent', 'Aktobe', 'Taraz', 'Pavlodar', 'Semey'],
  'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kericho', 'Nyeri', 'Kilifi'],
  'Kuwait': ['Kuwait City', 'Al Ahmadi', 'Al Farwaniyah', 'Hawalli', 'Mubarak Al-Kabir', 'Al Jahra', 'Sabah Al-Salem'],
  'Kyrgyzstan': ['Bishkek', 'Osh', 'Jalal-Abad', 'Karakol', 'Tokmok', 'Naryn', 'Batken', 'Kyzyl-Kiya'],
  'Laos': ['Vientiane', 'Luang Prabang', 'Savannakhet', 'Pakse', 'Thakhek', 'Udomxai', 'Luang Namtha'],
  'Latvia': ['Riga', 'Daugavpils', 'Liepaja', 'Jelgava', 'Jurmala', 'Ventspils', 'Rezekne', 'Ogre'],
  'Lebanon': ['Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Jounieh', 'Baalbek', 'Zahle', 'Byblos'],
  'Lesotho': ['Maseru', 'Teyateyaneng', 'Leribe', 'Mafeteng', 'Butha-Buthe', 'Qacha\'s Nek', 'Mohale\'s Hoek'],
  'Liberia': ['Monrovia', 'Gbarnga', 'Kakata', 'Voinjama', 'Buchanan', 'Robertsport', 'Harper'],
  'Libya': ['Tripoli', 'Benghazi', 'Misrata', 'Zawiya', 'Derna', 'Tobruk', 'Sirte', 'Zliten'],
  'Liechtenstein': ['Vaduz', 'Schaan', 'Triesen', 'Balzers', 'Mauren', 'Ruggell', 'Gamprin'],
  'Lithuania': ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus', 'Telšiai', 'Utena'],
  'Luxembourg': ['Luxembourg City', 'Esch-sur-Alzette', 'Differdange', 'Dudelange', 'Pétange', 'Sanem', 'Bettembourg'],
  'Madagascar': ['Antananarivo', 'Antsirabe', 'Fianarantsoa', 'Toliara', 'Mahajanga', 'Sambava', 'Toliara'],
  'Malawi': ['Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba', 'Kasungu', 'Salima', 'Mangochi'],
  'Malaysia': ['Kuala Lumpur', 'George Town', 'Ipoh', 'Shah Alam', 'Petaling Jaya', 'Klang', 'Subang Jaya', 'Ampang'],
  'Maldives': ['Malé', 'Addu City', 'Kulhudhuffushi', 'Funadhoo', 'Thinadhoo', 'Eydhafushi', 'Hithadhoo'],
  'Mali': ['Bamako', 'Koulikoro', 'Ségou', 'Mopti', 'Gao', 'Kayes', 'Timbuktu', 'Djenné'],
  'Malta': ['Valletta', 'Birkirkara', 'Mosta', 'Naxxar', 'San Pawl il-Baħar', 'Sliema', 'Mdina', 'Birgu'],
  'Marshall Islands': ['Majuro', 'Ebeye', 'Kwajalein', 'Arno', 'Mili', 'Jaluit', 'Wotje'],
  'Mauritania': ['Nouakchott', 'Nouadhibou', 'Kaédi', 'Rosso', 'Atar', 'Tidjikja', 'Kiffa'],
  'Mauritius': ['Port Louis', 'Beau Bassin-Rose Hill', 'Vacoas-Phoenix', 'Curepipe', 'Quatre Bornes', 'Triolet', 'Goodlands'],
  'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Toluca', 'Cancún', 'Acapulco', 'Querétaro'],
  'Micronesia': ['Palikir', 'Weno', 'Kolonia', 'Tol', 'Dublon', 'Moen', 'Udot'],
  'Moldova': ['Chișinău', 'Bender', 'Tiraspol', 'Balti', 'Orhei', 'Cahul', 'Soroca'],
  'Monaco': ['Monaco', 'Monte Carlo', 'La Rousse', 'Fontvieille', 'La Condamine', 'Jardin Exotique'],
  'Mongolia': ['Ulaanbaatar', 'Darhan', 'Darkhan', 'Choibalsan', 'Erdenet', 'Zuunmod', 'Arshan'],
  'Montenegro': ['Podgorica', 'Niksic', 'Pljevlja', 'Bijelo Polje', 'Kotor', 'Cetinje', 'Budva'],
  'Morocco': ['Casablanca', 'Fes', 'Tangier', 'Marrakesh', 'Agadir', 'Meknes', 'Oujda', 'Kenitra'],
  'Mozambique': ['Maputo', 'Matola', 'Beira', 'Nampula', 'Quelimane', 'Inhambane', 'Gaza', 'Chimoio'],
  'Myanmar': ['Yangon', 'Naypyidaw', 'Mandalay', 'Bagan', 'Mawlamyine', 'Tachileik', 'Sittwe', 'Myitkyina'],
  'Namibia': ['Windhoek', 'Walvis Bay', 'Oshakati', 'Katima Mulilo', 'Otjiwarongo', 'Okahandja', 'Rundu'],
  'Nepal': ['Kathmandu', 'Pokhara', 'Biratnagar', 'Dharan', 'Lalitpur', 'Birgunj', 'Janakpur', 'Itahari'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Tilburg', 'Almere'],
  'New Zealand': ['Auckland', 'Wellington', 'Christchurch', 'Hamiltom', 'Tauranga', 'Dunedin', 'Palmerston North', 'Rotorua'],
  'Nicaragua': ['Managua', 'León', 'Granada', 'Masaya', 'Chinandega', 'Estelí', 'Matagalpa', 'Tipitapa'],
  'Niger': ['Niamey', 'Zinder', 'Maradi', 'Tahoua', 'Agadez', 'Dosso', 'Diffa', 'Say'],
  'Nigeria': ['Lagos', 'Kano', 'Ibadan', 'Abuja', 'Kaduna', 'Port Harcourt', 'Enugu', 'Benin City'],
  'North Korea': ['Pyongyang', 'Hamhung', 'Chongjin', 'Nampo', 'Wonsan', 'Kaesong', 'Sinuiju', 'Sariwon'],
  'Norway': ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Kristiansand', 'Ålesund', 'Tromsø', 'Hamar'],
  'Oman': ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Rustaq', 'Ibri', 'Sur', 'Qurayyat'],
  'Pakistan': ['Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Hyderabad', 'Peshawar', 'Quetta'],
  'Palestine': ['Ramallah', 'Gaza City', 'Hebron', 'Nablus', 'Jenin', 'Tulkarm', 'Bethlehem'],
  'Panama': ['Panama City', 'San Miguelito', 'Colón', 'Changuinola', 'Penonomé', 'David', 'Tocumen'],
  'Papua New Guinea': ['Port Moresby', 'Lae', 'Madang', 'Mount Hagen', 'Goroka', 'Alotau', 'Kimbe'],
  'Paraguay': ['Asunción', 'Ciudad del Este', 'San Juan Bautista', 'Encarnación', 'Concepción', 'Coronel Oviedo', 'Caaguazú'],
  'Peru': ['Lima', 'Arequipa', 'Trujillo', 'Callao', 'Iquitos', 'Cusco', 'Chimbote', 'Huancayo'],
  'Philippines': ['Manila', 'Cebu', 'Davao', 'Caloocan', 'Quezon City', 'Zamboanga', 'Cagayan de Oro', 'Antipolo'],
  'Poland': ['Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz'],
  'Portugal': ['Lisbon', 'Porto', 'Covilhã', 'Coimbra', 'Aveiro', 'Braga', 'Funchal', 'Ponta Delgada'],
  'Qatar': ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al-Khor', 'Umm Salal Muhammad', 'Al Shamal', 'Al Daayen'],
  'Romania': ['Bucharest', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Craiova', 'Brașov', 'Galați'],
  'Russia': ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Nizhny Novgorod', 'Kazan', 'Chelyabinsk', 'Omsk'],
  'Rwanda': ['Kigali', 'Butare', 'Gitarama', 'Ruhengeri', 'Gisenyi', 'Kibuye', 'Cyangugu'],
  'Samoa': ['Apia', 'Upolu', 'Savai\'i', 'Manono', 'Faleula', 'Mulifanua', 'Lalomanu'],
  'San Marino': ['San Marino City', 'Serravalle', 'Acquaviva', 'Domagnano', 'Faetano', 'Fiorentino'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Abha', 'Taif'],
  'Senegal': ['Dakar', 'Thies', 'Kaolack', 'Saint-Louis', 'Tambacounda', 'Ziguinchor', 'Louga'],
  'Serbia': ['Belgrade', 'Novi Sad', 'Nis', 'Kragujevac', 'Subotica', 'Leskovac', 'Jagodina', 'Vranje'],
  'Seychelles': ['Victoria', 'Beau Vallon', 'Cascade', 'Glacis', 'Les Mamelles', 'Takamaka', 'Anse Royale'],
  'Sierra Leone': ['Freetown', 'Kenema', 'Bo', 'Makeni', 'Koidu Town', 'Lunsar', 'Port Loko'],
  'Singapore': ['Singapore'],
  'Slovakia': ['Bratislava', 'Košice', 'Prešov', 'Žilina', 'Banská Bystrica', 'Nitra', 'Trenčín', 'Trnava'],
  'Slovenia': ['Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Velenje', 'Novo Mesto', 'Jesenice', 'Trbovlje'],
  'Solomon Islands': ['Honiara', 'Buala', 'Kira Kira', 'Auki', 'Gizo', 'Labasa', 'Tulagi'],
  'Somalia': ['Mogadishu', 'Hargeisa', 'Bosaso', 'Kismayo', 'Baidoa', 'Galkacyo', 'Beledweyne'],
  'South Africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'Pietermaritzburg', 'East London'],
  'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan', 'Sejong'],
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao', 'Malaga', 'Murcia', 'Palma'],
  'Sri Lanka': ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Trincomalee', 'Anuradhapura', 'Matara'],
  'Sudan': ['Khartoum', 'Omdurman', 'Port Sudan', 'Al Obeid', 'Kassala', 'Geneina', 'Damazin'],
  'Suriname': ['Paramaribo', 'Lelydorp', 'Lelydorp', 'Albina', 'Groningen', 'Moengo', 'Coronie'],
  'Eswatini': ['Mbabane', 'Manzini', 'Piggs Peak', 'Siteki', 'Hlatikhulu', 'Nhlangano', 'Big Bend'],
  'Sweden': ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg'],
  'Switzerland': ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Lucerne', 'St. Gallen', 'Schaffhausen'],
  'Syria': ['Damascus', 'Aleppo', 'Homs', 'Hama', 'Latakia', 'Tartus', 'Raqqa', 'Hasaka'],
  'Taiwan': ['Taipei', 'New Taipei', 'Taichung', 'Tainan', 'Kaohsiung', 'Keelung', 'Hsinchu', 'Chiayi'],
  'Tajikistan': ['Dushanbe', 'Khujand', 'Khorog', 'Qurgonteppa', 'Kulob', 'Istravshan', 'Kanibadam'],
  'Tanzania': ['Dar es Salaam', 'Mwanza', 'Arusha', 'Mbeya', 'Morogoro', 'Iringa', 'Kigoma', 'Zanzibar'],
  'Thailand': ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Samut Prakan', 'Nakhon Ratchasima', 'Chon Buri', 'Rayong'],
  'Timor-Leste': ['Dili', 'Baucau', 'Maliana', 'Oecusse', 'Suai', 'Same', 'Lospalos'],
  'Togo': ['Lomé', 'Sokodé', 'Kpalimé', 'Atakpamé', 'Bassar', 'Dapaong', 'Tsévié'],
  'Tonga': ['Nuku\'alofa', 'Neiafu', 'Haveluloto', 'Vaini', 'Pangai', 'Ohonua', 'Koloa'],
  'Trinidad and Tobago': ['Port of Spain', 'San Fernando', 'Chaguanas', 'Point Fortin', 'Arima', 'Scarborough', 'Couva'],
  'Tunisia': ['Tunis', 'Sfax', 'Sousse', 'Gabès', 'Kairouan', 'Gafsa', 'Djerba', 'Tozeur'],
  'Turkey': ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Gaziantep', 'Konya'],
  'Turkmenistan': ['Ashgabat', 'Turkmenbashi', 'Balkanabat', 'Tejen', 'Sarahs', 'Mary', 'Gyzylarbat'],
  'Tuvalu': ['Funafuti', 'Vaitupu', 'Nukufetau', 'Nanumea', 'Nui', 'Niulao'],
  'Uganda': ['Kampala', 'Gulu', 'Lira', 'Mbarara', 'Masaka', 'Jinja', 'Soroti', 'Mbale'],
  'Ukraine': ['Kyiv', 'Kharkiv', 'Odessa', 'Dnipro', 'Lviv', 'Zaporizhzhia', 'Kryvyi Rih', 'Mykolaiv'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Al Fujairah', 'Umm Al Quwain', 'Dibba'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Sheffield', 'Bristol', 'Edinburgh'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'],
  'Uruguay': ['Montevideo', 'Salto', 'Paysandú', 'Tacuarembó', 'Melo', 'Florida', 'Rocha', 'Fray Bentos'],
  'Uzbekistan': ['Tashkent', 'Samarkand', 'Bukhara', 'Khiva', 'Fergana', 'Navoi', 'Andijan', 'Namangan'],
  'Vanuatu': ['Port Vila', 'Luganville', 'Isangel', 'Lakatoi', 'Norsup', 'Lenakel', 'Sola'],
  'Venezuela': ['Caracas', 'Maracaibo', 'Valencia', 'Maracay', 'Barquisimeto', 'Ciudad Guayana', 'Mérida'],
  'Vietnam': ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hai Phong', 'Can Tho', 'Bien Hoa', 'Nha Trang'],
  'Yemen': ['Sana\'a', 'Aden', 'Taiz', 'Hodeidah', 'Ibb', 'Dhamar', 'Abyan', 'Hadhramawt'],
  'Zambia': ['Lusaka', 'Ndola', 'Kitwe', 'Livingstone', 'Kabwe', 'Chingola', 'Mufulira'],
  'Zimbabwe': ['Harare', 'Bulawayo', 'Chitungwiza', 'Gweru', 'Mutare', 'Zvishavane', 'Kadoma'],
};

interface User {
  id?: string;
  email: string;
  name: string;
  role: 'student' | 'lecturer' | 'admin';
  lecturer_id?: string;
  admin_id?: string;
  registration_number?: string;
  created_at?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
  avatar_url?: string;
}

export default function Account() {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const { toast } = useToast();

  const [user] = useState<User | null>(currentUser as User);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [showLogoutOtherDevices, setShowLogoutOtherDevices] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    countryCode: '+1',
    address: user?.address || '',
    city: user?.city || '',
    country: user?.country || '',
    bio: user?.bio || '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    loginAlerts: true,
    activityUpdates: true,
    newsAndUpdates: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!user) {
    return (
      <DashboardLayout role="student" userName="User" onLogout={() => navigate('/')}>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Unable to load account information</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      console.log('Token:', localStorage.getItem('auth_token'));
      console.log('Profile form:', profileForm);
      const response = await apiClient.put('/auth/profile', profileForm);
      
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowEditProfileDialog(false);
      toast({
        title: 'Success',
        description: 'Your profile has been updated',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      console.error('Update profile error:', errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await apiClient.post('/auth/notification-preferences', notifications);
      
      setSuccessMessage('Notification preferences saved!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowNotificationsDialog(false);
      toast({
        title: 'Success',
        description: 'Notification preferences updated',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save preferences';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDownloadData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${apiClient.baseURLPublic}/auth/data-export`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user-data-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      toast({
        title: 'Success',
        description: 'Your data has been downloaded',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export data';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: 'Missing Fields',
        description: 'All password fields are required',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'New password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: 'New password and confirm password must match',
        variant: 'destructive',
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await apiClient.post('/auth/change-password', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      });

      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowPasswordDialog(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast({
        title: 'Success',
        description: 'Your password has been updated',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password. Please check your current password.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiClient.delete('/auth/account');
      
      setSuccessMessage('Account deletion initiated...');
      setTimeout(() => {
        logout();
        navigate('/');
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete account',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout role={user.role} userName={user.name} onLogout={() => navigate('/')}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account information and security</p>
        </div>

        {/* Profile Section */}
        <Card className="p-6 border-2">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white flex-shrink-0"
              style={{ backgroundColor: roleColors[user.role].bg }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground mt-1">{user.email}</p>

              <div className="flex items-center gap-2 mt-4">
                <Badge className="capitalize" style={{ backgroundColor: roleColors[user.role].bg }}>
                  {user.role}
                </Badge>
                {user.id && (
                  <Badge variant="outline">Account ID: {user.id.slice(0, 8)}...</Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <Label className="text-xs text-gray-600 font-medium">Email Address</Label>
                  <p className="text-sm font-medium mt-1">{user.email}</p>
                </div>

                {user.role === 'lecturer' && user.lecturer_id && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Label className="text-xs text-gray-600 font-medium">Lecturer ID</Label>
                    <p className="text-sm font-medium mt-1 font-mono">{user.lecturer_id}</p>
                  </div>
                )}

                {user.role === 'admin' && user.admin_id && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Label className="text-xs text-gray-600 font-medium">Admin ID</Label>
                    <p className="text-sm font-medium mt-1 font-mono">{user.admin_id}</p>
                  </div>
                )}

                {user.role === 'student' && user.registration_number && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Label className="text-xs text-gray-600 font-medium">Registration Number</Label>
                    <p className="text-sm font-medium mt-1 font-mono">{user.registration_number}</p>
                  </div>
                )}

                {user.created_at && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Label className="text-xs text-gray-600 font-medium">Account Created</Label>
                    <p className="text-sm font-medium mt-1">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Security Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </h3>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h4 className="font-semibold">Password</h4>
                  <p className="text-sm text-muted-foreground">Change your account password</p>
                </div>
                <Button onClick={() => setShowPasswordDialog(true)} variant="outline">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Session</h4>
                  <p className="text-sm text-muted-foreground">Manage your active sessions</p>
                </div>
                <Button variant="outline">View Sessions</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Profile Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </h3>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Full Name</Label>
                  <p className="text-sm mt-2 text-muted-foreground">{user?.name || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email Address</Label>
                  <p className="text-sm mt-2 text-muted-foreground">{user?.email || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone Number</Label>
                  <p className="text-sm mt-2 text-muted-foreground">{user?.phone || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm mt-2 text-muted-foreground">
                    {user?.city && user?.country ? `${user.city}, ${user.country}` : 'Not set'}
                  </p>
                </div>
              </div>
              {user?.bio && (
                <div>
                  <Label className="text-sm font-medium">Bio</Label>
                  <p className="text-sm mt-2 text-muted-foreground">{user.bio}</p>
                </div>
              )}
              <Button onClick={() => setShowEditProfileDialog(true)} variant="outline">
                Edit Profile
              </Button>
            </div>
          </Card>
        </div>

        {/* Preferences Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Preferences & Notifications
          </h3>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <h4 className="font-semibold text-sm">Email Notifications</h4>
                  <p className="text-xs text-muted-foreground mt-1">Receive email updates about your account</p>
                </div>
                <Button variant="outline" size="sm">
                  {notifications.emailNotifications ? '✓ On' : 'Off'}
                </Button>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <h4 className="font-semibold text-sm">Login Alerts</h4>
                  <p className="text-xs text-muted-foreground mt-1">Get notified of new login attempts</p>
                </div>
                <Button variant="outline" size="sm">
                  {notifications.loginAlerts ? '✓ On' : 'Off'}
                </Button>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <h4 className="font-semibold text-sm">Activity Updates</h4>
                  <p className="text-xs text-muted-foreground mt-1">Updates about your activities</p>
                </div>
                <Button variant="outline" size="sm">
                  {notifications.activityUpdates ? '✓ On' : 'Off'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">News & Updates</h4>
                  <p className="text-xs text-muted-foreground mt-1">Latest news and product updates</p>
                </div>
                <Button variant="outline" size="sm">
                  {notifications.newsAndUpdates ? '✓ On' : 'Off'}
                </Button>
              </div>
              <Button onClick={() => setShowNotificationsDialog(true)} className="w-full mt-4">
                Manage Preferences
              </Button>
            </div>
          </Card>
        </div>

        {/* Privacy & Data Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Download className="w-5 h-5" />
            Privacy & Data
          </h3>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h4 className="font-semibold">Download Your Data</h4>
                  <p className="text-sm text-muted-foreground mt-1">Get a copy of all your account data</p>
                </div>
                <Button onClick={handleDownloadData} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Active Sessions</h4>
                  <p className="text-sm text-muted-foreground mt-1">Manage your active sessions and devices</p>
                </div>
                <Button onClick={() => setShowLogoutOtherDevices(true)} variant="outline">
                  <Smartphone className="w-4 h-4 mr-2" />
                  View Sessions
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Account Actions */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Account Actions
          </h3>

          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-red-900">Delete Account</h4>
                <p className="text-sm text-red-700 mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive"
                className="flex-shrink-0"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="text-gray-700 font-medium">
                Current Password
              </Label>
              <div className="relative mt-2">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword" className="text-gray-700 font-medium">
                New Password
              </Label>
              <div className="relative mt-2">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                Confirm Password
              </Label>
              <div className="relative mt-2">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={passwordLoading}
                className="flex-1"
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete your account? This action cannot be undone.
              All your data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfileDialog} onOpenChange={setShowEditProfileDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  Phone Number
                </Label>
                <div className="flex gap-2 mt-2">
                  <div className="bg-gray-100 rounded-md px-3 py-2 flex items-center text-sm font-medium border border-gray-300 min-w-[80px] justify-center">
                    {profileForm.countryCode}
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address" className="text-gray-700 font-medium">
                  Address
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Street address"
                  value={profileForm.address}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="country" className="text-gray-700 font-medium">
                  Country
                </Label>
                <Select
                  value={profileForm.country}
                  onValueChange={(value) => {
                    setProfileForm((prev) => ({
                      ...prev,
                      country: value,
                      city: '',
                      countryCode: getCountryCodeByName(value),
                    }));
                  }}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CITIES_BY_COUNTRY).map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city" className="text-gray-700 font-medium">
                  City
                </Label>
                <Select
                  value={profileForm.city}
                  onValueChange={(value) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      city: value,
                    }))
                  }
                  disabled={!profileForm.country}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={profileForm.country ? "Select city" : "Select country first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {profileForm.country && CITIES_BY_COUNTRY[profileForm.country]?.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="bio" className="text-gray-700 font-medium">
                Bio
              </Label>
              <textarea
                id="bio"
                placeholder="Tell us about yourself"
                value={profileForm.bio}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    bio: e.target.value,
                  }))
                }
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
              >
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditProfileDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={showNotificationsDialog} onOpenChange={setShowNotificationsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Notification Preferences</DialogTitle>
            <DialogDescription>
              Choose what notifications you'd like to receive
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex-1">
                <Label className="font-medium cursor-pointer">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive email updates about your account
                </p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({
                    ...prev,
                    emailNotifications: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex-1">
                <Label className="font-medium cursor-pointer">
                  Login Alerts
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Get notified when someone logs into your account
                </p>
              </div>
              <Switch
                checked={notifications.loginAlerts}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({
                    ...prev,
                    loginAlerts: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex-1">
                <Label className="font-medium cursor-pointer">
                  Activity Updates
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Updates about your activities and schedules
                </p>
              </div>
              <Switch
                checked={notifications.activityUpdates}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({
                    ...prev,
                    activityUpdates: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="font-medium cursor-pointer">
                  News & Updates
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Latest news and product updates
                </p>
              </div>
              <Switch
                checked={notifications.newsAndUpdates}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({
                    ...prev,
                    newsAndUpdates: checked,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSaveNotifications}
              className="flex-1"
            >
              Save Preferences
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowNotificationsDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Other Devices Dialog */}
      <Dialog open={showLogoutOtherDevices} onOpenChange={setShowLogoutOtherDevices}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Active Sessions</DialogTitle>
            <DialogDescription>
              Manage your active sessions and devices
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-sm">Current Device</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Browser: Chrome on Windows</p>
                  <p className="text-xs text-muted-foreground">Active now</p>
                </div>
                <Badge className="bg-blue-600">Current</Badge>
              </div>
            </div>

            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                No other active sessions
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-3">
                Logging out from other devices will sign them out of your account.
              </p>
              <Button
                onClick={() => {
                  alert('Successfully logged out from all other devices');
                  setShowLogoutOtherDevices(false);
                }}
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout All Other Devices
              </Button>
            </div>
          </div>

          <div className="flex">
            <Button
              variant="outline"
              onClick={() => setShowLogoutOtherDevices(false)}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
