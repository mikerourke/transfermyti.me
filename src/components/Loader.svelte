<style>
  @keyframes cube-folding {
    0%,
    10% {
      transform: perspective(140px) rotateX(-180deg);
      opacity: 0;
    }

    25%,
    75% {
      transform: perspective(140px) rotateX(0deg);
      opacity: 1;
    }

    90%,
    100% {
      transform: perspective(140px) rotateY(180deg);
      opacity: 0;
    }
  }

  [data-wrapper] {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  [data-cubes] {
    transform: rotateZ(45deg);
    margin: 2rem auto;
    width: 6rem;
    height: 6rem;
  }

  span {
    display: block;
    position: relative;
    height: 50%;
    width: 50%;
    float: left;
  }

  span::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform-origin: 100% 100%;
    content: "";
    animation: cube-folding 2.4s infinite linear both;
    background-color: var(--color-primary);
  }

  [data-cubes] span:first-of-type {
    transform: scale(1.1) rotateZ(0deg);
  }

  [data-cubes] span:first-of-type::before {
    animation-delay: 0ms;
  }

  [data-cubes] span:nth-of-type(2) {
    transform: scale(1.1) rotateZ(90deg);
  }

  [data-cubes] span:nth-of-type(2)::before {
    animation-delay: 300ms;
  }

  [data-cubes] span:nth-of-type(3) {
    transform: scale(1.1) rotateZ(270deg);
  }

  [data-cubes] span:nth-of-type(3)::before {
    animation-delay: 900ms;
  }

  [data-cubes] span:last-of-type {
    transform: scale(1.1) rotateZ(180deg);
  }

  [data-cubes] span:last-of-type::before {
    animation-delay: 600ms;
  }
</style>

<div data-wrapper>
  <div data-cubes>
    <span />
    <span />
    <span />
    <span />
  </div>

  {#if $$slots.default}
    <p class="loadingMessage"><slot /></p>
  {/if}
</div>
