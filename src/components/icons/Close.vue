<template>
  <!--
    Derivado do Plus do projeto: mesmo traçado, girado 45° dentro do viewBox.
    Evita depender do X do @lucide/vue que o kit usa internamente, proibido
    pela R7, e mantém peso e cantos idênticos aos demais ícones daqui.
  -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="currentColor"
    v-bind="$attrs"
  >
    <path
      transform="rotate(45 8 8)"
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M8.53372 2.93324C8.53372 2.63869 8.29494 2.3999 8.00039 2.3999C7.70584 2.3999 7.46706 2.63869 7.46706 2.93324V7.46657H2.93372C2.63917 7.46657 2.40039 7.70535 2.40039 7.9999C2.40039 8.29445 2.63917 8.53324 2.93372 8.53324H7.46706V13.0666C7.46706 13.3611 7.70584 13.5999 8.00039 13.5999C8.29494 13.5999 8.53372 13.3611 8.53372 13.0666V8.53324H13.0671C13.3616 8.53324 13.6004 8.29445 13.6004 7.9999C13.6004 7.70535 13.3616 7.46657 13.0671 7.46657H8.53372V2.93324Z"
    />
  </svg>
</template>
