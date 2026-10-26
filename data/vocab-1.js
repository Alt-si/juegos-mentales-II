// Vocabulario de Palabra escondida — parte 1: seres vivos, comida, cuerpo
// Formato de cada línea:  dominio/categoría/subcategoría|etiqueta,etiqueta: palabras en orden de parecido
// Las palabras vecinas en una misma línea se consideran más cercanas entre sí.
window.__vocabAdd(`
animales/mamíferos/mascotas|animal,hogar,mascota: perro cachorro perra gato gatito gata hámster cobayo conejo hurón chinchilla mascota
animales/mamíferos/razas|animal,hogar,mascota: caniche labrador ovejero dogo bulldog rottweiler chihuahua beagle salchicha galgo siamés persa angora
animales/mamíferos/granja|animal,campo,granja: vaca toro ternero buey oveja cordero carnero cabra chivo cerdo chancho lechón caballo yegua potro burro mula llama alpaca guanaco vicuña
animales/mamíferos/felinos|animal,salvaje,selva: león leona tigre leopardo pantera jaguar puma lince guepardo yaguareté ocelote
animales/mamíferos/salvajes|animal,salvaje: lobo zorro coyote oso panda koala canguro elefante jirafa cebra hipopótamo rinoceronte búfalo bisonte ciervo venado alce reno antílope gacela camello dromedario
animales/mamíferos/pequeños|animal: ratón rata ardilla castor topo erizo murciélago mapache zorrino comadreja nutria liebre vizcacha carpincho armadillo mulita hurón
animales/mamíferos/primates|animal,selva: mono gorila chimpancé orangután babuino mandril lémur simio
animales/mamíferos/marinos|animal,mar,agua: ballena delfín orca foca lobo marino morsa manatí cachalote
animales/aves/comunes|animal,aire,cielo: pájaro ave pajarito gorrión paloma golondrina hornero zorzal calandria benteveo tero colibrí picaflor canario jilguero cardenal mirlo
animales/aves/rapaces|animal,aire,salvaje: águila halcón cóndor buitre gavilán carancho chimango búho lechuza
animales/aves/acuáticas|animal,agua,mar: pato ganso cisne gaviota pelícano flamenco garza cigüeña pingüino albatros cormorán
animales/aves/granja|animal,campo,granja: gallina gallo pollito pollo pavo codorniz ñandú avestruz
animales/aves/coloridas|animal,selva: loro cotorra papagayo guacamayo tucán pavo real
animales/peces/peces|animal,agua,mar: pez peces pescado trucha salmón merluza atún sardina dorado surubí pejerrey bagre tiburón raya pez espada anguila carpa piraña
animales/mar/invertebrados|animal,mar,agua: pulpo calamar medusa estrella cangrejo langosta langostino camarón almeja mejillón ostra caracol coral erizo esponja
animales/insectos/insectos|animal,campo,pequeño: insecto hormiga abeja avispa mosca mosquito mariposa polilla escarabajo vaquita grillo saltamontes langosta cucaracha libélula luciérnaga pulga piojo garrapata chinche termita
animales/insectos/otros|animal,pequeño: araña alacrán escorpión gusano lombriz ciempiés babosa caracol
animales/reptiles/reptiles|animal,salvaje: serpiente víbora culebra boa anaconda cobra yarará lagarto lagartija iguana camaleón cocodrilo yacaré caimán tortuga dinosaurio dragón
animales/anfibios/anfibios|animal,agua: rana sapo renacuajo salamandra
animales/partes/partes|animal,cuerpo: pata patas cola hocico pico ala alas pluma plumas pelaje melena garra garras pezuña casco cuerno cuernos colmillo escama escamas aleta branquias caparazón trompa joroba bigote
animales/acciones/sonidos|animal,ruido: ladrar ladrido maullar maullido ronronear rugir rugido aullar aullido relinchar mugir balar cacarear piar trinar zumbar croar gruñir
animales/lugares/lugares|animal,lugar: zoológico granja establo corral gallinero chiquero caballeriza colmena hormiguero nido cueva madriguera acuario jaula pecera perrera veterinaria
plantas/árboles/árboles|planta,naturaleza,bosque: árbol pino roble sauce eucalipto ombú jacarandá palmera álamo ceibo fresno olmo cedro abeto plátano lapacho tala algarrobo quebracho araucaria nogal arce
plantas/flores/flores|planta,naturaleza,color: flor rosa margarita girasol tulipán clavel jazmín lirio orquídea violeta lavanda azucena amapola hortensia geranio camelia magnolia petunia
plantas/partes/partes|planta,naturaleza: hoja hojas rama ramas tronco raíz raíces tallo pétalo pétalos semilla semillas brote capullo espina espinas corteza savia polen néctar fruto
plantas/otras/plantas|planta,naturaleza: planta plantas arbusto pasto césped hierba yuyo musgo helecho cactus enredadera hiedra junco caña bambú hongo hongos alga trébol maleza
plantas/frutas/frutas|comida,planta,dulce: fruta manzana pera banana naranja mandarina limón pomelo uva frutilla cereza durazno ciruela damasco kiwi ananá piña mango melón sandía higo membrillo frambuesa arándano mora coco palta granada
plantas/verduras/verduras|comida,planta: verdura tomate lechuga zanahoria papa batata cebolla ajo morrón pimiento zapallo calabaza zapallito berenjena pepino espinaca acelga brócoli coliflor repollo apio remolacha rabanito choclo arveja chaucha
plantas/granos/granos|comida,planta,campo: trigo maíz arroz avena cebada centeno soja girasol lenteja garbanzo poroto frijol maní nuez almendra avellana castaña semilla cereal
plantas/hierbas/hierbas|comida,planta: perejil albahaca orégano romero tomillo menta cilantro laurel ciboulette salvia manzanilla cedrón yerba
comida/platos/argentina|comida,hogar,fiesta: asado empanada milanesa locro choripán pizza fideos ravioles ñoquis guiso puchero tarta matambre provoleta humita tamal sorrentinos canelones lasaña
comida/platos/general|comida: comida plato sopa caldo ensalada hamburguesa sándwich sanguche pancho tostado omelette tortilla arroz pasta estofado puré salsa
comida/panadería/panadería|comida,dulce: pan factura medialuna medialunas bizcocho tostada galleta galletita budín torta tarta masa harina levadura grisín baguette rosca vigilante
comida/dulces/dulces|comida,dulce,niños: dulce postre chocolate caramelo golosina chupetín chicle alfajor helado flan mousse merengue crema dulce de leche mermelada miel azúcar bombón turrón gelatina pochoclo churro panqueque waffle
comida/lácteos/lácteos|comida: leche queso manteca yogur crema ricota mozzarella muzzarella parmesano roquefort leche condensada
comida/carnes/carnes|comida: carne pollo vacío bife lomo costilla chorizo morcilla salchicha jamón salame mortadela panceta hamburguesa pescado mariscos huevo huevos fiambre
comida/bebidas/bebidas|comida,agua: bebida agua jugo gaseosa soda refresco limonada licuado café té mate leche chocolatada infusión
comida/bebidas/alcohol|comida,fiesta: vino cerveza fernet whisky vodka ron champán sidra licor aperitivo cóctel trago
comida/condimentos/condimentos|comida,cocina: sal pimienta aceite vinagre mostaza mayonesa ketchup salsa condimento especia comino pimentón ají canela vainilla nuez moscada
comida/momentos/comidas|comida,tiempo,hogar: desayuno almuerzo merienda cena picada brunch banquete menú
comida/cocina/utensilios|comida,cocina,hogar: olla sartén cacerola cuchillo cuchara tenedor cucharón espátula plato platos vaso taza jarra fuente bandeja colador rallador batidor tabla abrelatas sacacorchos termo mate bombilla pava
comida/cocina/acciones|comida,cocina: cocinar hervir freír hornear asar picar cortar pelar rallar batir mezclar amasar condimentar probar servir comer beber tomar masticar tragar
comida/cualidades/sabores|comida,sentido: sabor rico delicioso sabroso dulce salado amargo ácido picante agrio insípido crocante jugoso tierno
comida/lugares/lugares|comida,ciudad,lugar: restaurante restorán parrilla bodegón cafetería confitería bar pizzería heladería panadería carnicería verdulería almacén supermercado kiosco feria mercado rotisería
cuerpo/partes/cabeza|cuerpo: cabeza cara rostro frente ojo ojos nariz boca labio labios lengua diente dientes oreja orejas oído mejilla cachete mentón barbilla ceja cejas pestaña pestañas pelo cabello barba bigote cuello nuca
cuerpo/partes/tronco|cuerpo: cuerpo pecho espalda hombro hombros cintura panza barriga vientre ombligo cadera cola trasero
cuerpo/partes/extremidades|cuerpo: brazo brazos codo muñeca mano manos dedo dedos uña uñas pulgar puño pierna piernas rodilla tobillo pie pies talón muslo
cuerpo/órganos/órganos|cuerpo,salud: corazón pulmón pulmones cerebro hígado riñón estómago intestino sangre hueso huesos esqueleto músculo músculos piel nervio nervios vena venas arteria columna cráneo costilla
cuerpo/sentidos/sentidos|cuerpo,mente: vista visión oído olfato gusto tacto mirar ver escuchar oír oler tocar sentir sabor olor sonido mirada
salud/enfermedad/enfermedades|salud,cuerpo: enfermedad gripe resfrío resfriado fiebre tos dolor herida lesión fractura alergia infección virus bacteria cáncer diabetes asma covid pandemia epidemia contagio síntoma mareo vómito náusea migraña
salud/medicina/medicina|salud: medicina remedio medicamento pastilla jarabe vacuna inyección vendaje venda curita receta tratamiento cirugía operación terapia análisis radiografía diagnóstico chequeo internación
salud/lugares/lugares|salud,ciudad,lugar: hospital clínica sanatorio consultorio farmacia guardia ambulancia quirófano laboratorio
salud/estado/estado|salud,vida: salud sano enfermo bienestar cansancio cansado sueño hambre sed energía fuerza debilidad
`);
