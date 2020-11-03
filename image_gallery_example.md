# Image Gallery Sample Code (https://glidejs.com/docs/setup/)

## Libraries
<script src="https://cdn.jsdelivr.net/npm/@glidejs/glide"></script>
<link rel="stylesheet" href="css/glide.core.css">
<link rel="stylesheet" href="css/glide.theme.css">

## HTML
```
<div class="glide">
    <div data-glide-el="track" class="glide__track">
        <ul class="glide__slides">
            <li class="glide__slide"><img style="height: 300px" src="./media" /></li>
            <li class="glide__slide"><img style="height: 300px" src="./media" /></li>
            <li class="glide__slide"><img style="height: 300px" src="./media" /></li>
        </ul>
    </div>
    <div class="glide__arrows" data-glide-el="controls">
        <button class="glide__arrow glide__arrow--left" data-glide-dir="<">prev</button>
        <button class="glide__arrow glide__arrow--right" data-glide-dir=">">next</button>
    </div>
</div>
```

### Javascript
```
<script>
    var glide = new Glide('.glide').mount()
    // stuff below is for custom buttons
    var nextButton = document.querySelector('#next');
    var prevButton = document.querySelector('#prev');
    nextButton.addEventListener('click', function (event) {
        event.preventDefault();
        glide.go('>');
    })

    prevButton.addEventListener('click', function (event) {
        event.preventDefault();
        glide.go('<');
    })
</script>

```