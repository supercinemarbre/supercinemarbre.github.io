<template>
    <h1 class="logo">
        <RouterLink to="/">
            <img src="/img/logo.png" />
            Super Ciné Marbre
        </RouterLink>
    </h1>
</template>

<style lang="scss" scoped>
.logo {
  font-size: 0px;

  & img {
    margin-top: 3px;
    max-height: 32px;
    transition: 0.2s;

    @media (max-width: 600px) {
      max-width: 200px;
    }

    @media (max-width: 300px) {
      max-width: 150px;
    }
  }

  &:hover,
  &:hover img {
    filter: brightness(1.2);
  }
}
</style>