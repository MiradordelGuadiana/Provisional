document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. Efecto Navbar al hacer scroll
    // ==========================================
    const navbar = document.getElementById("navbar");
    if(navbar) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 50) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        });
    }

    // ==========================================
    // 2. Animación Reveal (Aparición de elementos)
    // ==========================================
    const reveals = document.querySelectorAll(".reveal");
    if(reveals.length > 0) {
        const revealOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };
        const revealOnScroll = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        }, revealOptions);

        reveals.forEach(reveal => revealOnScroll.observe(reveal));
    }

    // 3. Lógica de los Acordeones (Desplegables) de la Carta

document.querySelectorAll('.accordion-header').forEach(button => {

    button.addEventListener('click', () => {

        const accordionContent = button.nextElementSibling;

       

        // Alternamos la clase activa en el botón

        button.classList.toggle('active');

       

        // Expande o contrae basándose en la altura real (scrollHeight)

        if (button.classList.contains('active')) {

            accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";

           

            // Cerrar las otras categorías si están abiertas

            document.querySelectorAll('.accordion-header').forEach(otherBtn => {

                if(otherBtn !== button) {

                    otherBtn.classList.remove('active');

                    otherBtn.nextElementSibling.style.maxHeight = 0;

                }

            });

        } else {

            accordionContent.style.maxHeight = 0;

        }

    });

});

    

    // ==========================================
    // 4. Carrusel de Sugerencias
    // ==========================================
    const track = document.getElementById('carouselTrack');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    
    if (track && btnPrev && btnNext) {
        let currentIndex = 0;
        const slides = document.querySelectorAll('.carousel-slide');
        const totalSlides = slides.length;

        function updateCarousel() {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        btnNext.addEventListener('click', () => {
            if (currentIndex < totalSlides - 1) {
                currentIndex++;
            } else {
                currentIndex = 0; 
            }
            updateCarousel();
        });

        btnPrev.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = totalSlides - 1; 
            }
            updateCarousel();
        });

        // Autoplay del carrusel (cada 5 segundos)
        setInterval(() => {
            if (currentIndex < totalSlides - 1) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateCarousel();
        }, 5000); 
    }

    // ==========================================
    // 5. Envío del Formulario de Reserva y WhatsApp
    // ==========================================
    const formReserva = document.getElementById('form-reserva');
    const mensajeDiv = document.getElementById('mensaje-reserva');
    const inputFecha = document.getElementById('fecha');

    if (inputFecha) {
        const hoy = new Date().toISOString().split('T')[0];
        inputFecha.setAttribute('min', hoy);
    }

    let enviandoReserva = false; 

    if(formReserva) {
        formReserva.onsubmit = function(e) {
            e.preventDefault(); 
            
            if (enviandoReserva) return; 
            enviandoReserva = true; 
            
            const btnSubmit = formReserva.querySelector('.btn-submit');
            btnSubmit.disabled = true; 
            btnSubmit.textContent = 'Procesando...'; 
            
            const formData = new FormData(this);

            fetch('procesar_reserva.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                if(data.trim() === "success") {
                    mensajeDiv.innerHTML = '<div class="alert alert-success">¡Reserva guardada! Redirigiendo a WhatsApp para confirmar...</div>';
                    
                    // --- MAGIA DE WHATSAPP ---
                    // 1. Recogemos los valores que el cliente acaba de escribir
                    const nom = document.getElementById('nombre').value;
                    const fec = document.getElementById('fecha').value;
                    const hor = document.getElementById('hora').value;
                    const per = document.getElementById('personas').value;
                    const com = document.getElementById('comentario').value;

                    // 2. Montamos el mensaje con formato (los asteriscos hacen negrita en WhatsApp)
                    let mensajeWA = `¡Hola! Acabo de realizar una reserva a través de la página web. Aquí están mis datos:\n\n`;
                    mensajeWA += `· *Nombre:* ${nom}\n`;
                    mensajeWA += `· *Fecha:* ${fec}\n`;
                    mensajeWA += `· *Hora:* ${hor}\n`;
                    mensajeWA += `· *Personas:* ${per}\n`;
                    
                    if (com.trim() !== "") {
                        mensajeWA += `*Comentario:* ${com}\n`;
                    }
                    
                    mensajeWA += `\n¿Me confirmáis que está todo correcto? ¡Gracias!`;

                    // 3. El número de teléfono del dueño (SIN el +, SIN ceros delante y SIN espacios)
                    
                    const telefonoDueño = "34615186382";

                    // 4. Codificamos el texto para que las URLs lo entiendan (convierte espacios en %20, etc.)
                    const textoCodificado = encodeURIComponent(mensajeWA);

                    // 5. Creamos el enlace oficial de WhatsApp y lo abrimos en una nueva pestaña
                    const urlWhatsApp = `https://wa.me/${telefonoDueño}?text=${textoCodificado}`;
                    window.open(urlWhatsApp, '_blank');
                    // -------------------------

                    formReserva.reset(); 
                } else {
                    mensajeDiv.innerHTML = '<div class="alert alert-error">Hubo un error al procesar tu reserva. Error: ' + data + '</div>';
                }
            })
            .catch(error => {
                mensajeDiv.innerHTML = '<div class="alert alert-error">Error de conexión con el servidor.</div>';
            })
            .finally(() => {
                enviandoReserva = false; 
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Confirmar Reserva';
            });
        };
    }
    // ==========================================
    // 6. Generador de horas (Comida: 12-16h | Cena: 19-00h)
    // ==========================================
    const selectHora = document.getElementById('hora');
    
    if (selectHora) {
        // IMPORTANTE: Limpiamos el selector para evitar que salgan "dos días" o horas duplicadas
        selectHora.innerHTML = '<option value="" disabled selected>Selecciona una hora...</option>';
        
        // Definimos los turnos: Comida (12 a 15:45) y Cena (19 a 23:45)
        const turnos = [
            { inicio: 12, fin: 15 }, // Turno de comida
            { inicio: 19, fin: 23 }  // Turno de cena
        ];

        turnos.forEach(turno => {
            for (let h = turno.inicio; h <= turno.fin; h++) {
                for (let m = 0; m < 60; m += 15) {
                    let horaStr = h.toString().padStart(2, '0');
                    let minStr = m.toString().padStart(2, '0');
                    let timeValue = `${horaStr}:${minStr}`;
                    
                    let option = document.createElement('option');
                    option.value = timeValue;
                    option.textContent = timeValue;
                    selectHora.appendChild(option);
                }
            }
        });
    }

    // ==========================================
    // 7. Bloquear letras en el campo de teléfono
    // ==========================================
    const inputTelefono = document.getElementById('telefono');
    
    if (inputTelefono) {
        inputTelefono.addEventListener('input', function(e) {
            // La expresión regular /\D/g busca todo lo que NO sea un número.
            // Si encuentra una letra o símbolo, lo reemplaza por "nada" (lo borra).
            this.value = this.value.replace(/\D/g, '');
        });
    }

    // ==========================================
    // 8. Menú Hamburguesa para Móviles
    // ==========================================
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    if (hamburger && navLinks) {
        // Al hacer clic en las 3 rayitas, abrimos/cerramos el menú
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Si el usuario hace clic en un enlace (ej: "Carta"), cerramos el menú automáticamente
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

});
