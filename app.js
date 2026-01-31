let observer = new IntersectionObserver((entries, observer) =>{
    entries.filter(e => e.isIntersecting).forEach(entry =>{
        entry.target.classList.add("scrolled");
        observer.unobserve(entry.target)
        console.log(entry.target + " animated")
    });
});
