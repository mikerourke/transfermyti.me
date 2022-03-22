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

  [data-cube] {
    display: block;
    float: left;
    width: 50%;
    height: 50%;
    position: relative;
    transform: scale(1.1);
  }

  [data-cube]::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    content: "";
    animation: cube-folding 2.4s infinite linear both;
    transform-origin: 100% 100%;
    background-color: var(--color-primary);
  }

  [data-cube="1"] {
    transform: scale(1.1) rotateZ(0deg);
    animation-delay: 0s;
  }

  [data-cube="2"] {
    transform: scale(1.1) rotateZ(90deg);
    animation-delay: 0.3s;
  }

  [data-cube="3"] {
    transform: scale(1.1) rotateZ(270deg);
    animation-delay: 0.9s;
  }

  [data-cube="4"] {
    transform: scale(1.1) rotateZ(180deg);
    animation-delay: 0.6s;
  }
</style>

<div data-wrapper>
  <div data-cubes>
    <span data-cube="1" />
    <span data-cube="2" />
    <span data-cube="3" />
    <span data-cube="4" />
  </div>

  {#if $$slots.default}
    <p class="loadingMessage"><slot /></p>
  {/if}
</div>
