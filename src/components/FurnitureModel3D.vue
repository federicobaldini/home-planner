<template>
  <TresGroup ref="modelRef" :position="pos" :rotation="[0, rotY, 0]">

    <!-- ═══ LETTO ══════════════════════════════════════════════════════════════ -->
    <template v-if="kind === 'letto'">
      <TresMesh v-for="([lx,lz], i) in g.legCorners" :key="`leg${i}`" :position="[lx, g.bot + g.LEG*0.5, lz]">
        <TresBoxGeometry :args="[0.05, g.LEG, 0.05]" />
        <TresMeshStandardMaterial :color="WOOD_D" :roughness="0.75" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + g.LEG + g.FRAME*0.5, 0]">
        <TresBoxGeometry :args="[g.w, g.FRAME, g.d]" />
        <TresMeshStandardMaterial :color="WOOD_L" :roughness="0.78" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + g.LEG + g.FRAME + g.MATT*0.5, 0]">
        <TresBoxGeometry :args="[g.w - 0.04, g.MATT, g.d - 0.06]" />
        <TresMeshStandardMaterial color="#f2ede8" :roughness="0.95" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + g.h*0.5, g.hd - 0.04]">
        <TresBoxGeometry :args="[g.w, g.h, 0.08]" />
        <TresMeshStandardMaterial :color="WOOD_L" :roughness="0.78" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh v-for="(px, i) in g.pillows" :key="`pill${i}`"
        :position="[px, g.bot + g.LEG + g.FRAME + g.MATT + 0.06, g.hd - 0.24]">
        <TresBoxGeometry :args="[g.pillowW, 0.12, 0.42]" />
        <TresMeshStandardMaterial color="#f8f4ee" :roughness="0.9" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ DIVANO / POLTRONA ═══════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'divano' || kind === 'poltrona'">
      <TresMesh v-for="([lx,lz], i) in g.legCorners" :key="`leg${i}`" :position="[lx, g.bot + 0.04, lz]">
        <TresBoxGeometry :args="[0.04, 0.08, 0.04]" />
        <TresMeshStandardMaterial :color="WOOD_D" :roughness="0.7" :side="2" v-bind="sel" />
      </TresMesh>
      <template v-if="g.doubleChaise">
        <TresMesh v-for="(cx, i) in g.chaiseX" :key="`chaise${i}`" :position="[cx, g.bot + 0.08 + g.SEAT_H*0.5, -g.hd + g.chaiseD*0.5]">
          <TresBoxGeometry :args="[g.chaiseW, g.SEAT_H, g.chaiseD]" />
          <TresMeshStandardMaterial :color="g.sofaColor" :roughness="0.96" :side="2" v-bind="sel" />
        </TresMesh>
        <TresMesh :position="[0, g.bot + 0.08 + g.SEAT_H*0.5, -g.hd + g.SEAT_D*0.5]">
          <TresBoxGeometry :args="[g.middleSeatW, g.SEAT_H, g.SEAT_D]" />
          <TresMeshStandardMaterial :color="g.sofaColor" :roughness="0.96" :side="2" v-bind="sel" />
        </TresMesh>
        <TresMesh :position="[0, g.bot + 0.08 + g.BACK_H*0.5, g.hd - g.BACK_D*0.5]">
          <TresBoxGeometry :args="[g.w, g.BACK_H, g.BACK_D]" />
          <TresMeshStandardMaterial :color="g.sofaColor" :roughness="0.95" :side="2" v-bind="sel" />
        </TresMesh>
        <TresMesh v-for="(ax, i) in g.armX" :key="`arm${i}`" :position="[ax, g.bot + 0.08 + g.ARM_H*0.5, 0]">
          <TresBoxGeometry :args="[g.ARM_W, g.ARM_H, g.d]" />
          <TresMeshStandardMaterial :color="g.sofaColor" :roughness="0.95" :side="2" v-bind="sel" />
        </TresMesh>
        <TresMesh v-for="(px, i) in g.sofaPillowX" :key="`pillow${i}`" :position="[px, g.bot + 0.08 + g.SEAT_H + g.h*0.12, g.hd - g.BACK_D - 0.04]">
          <TresBoxGeometry :args="[g.pillowSofaW, g.h*0.34, 0.08]" />
          <TresMeshStandardMaterial color="#efe4d4" :roughness="0.98" :side="2" v-bind="sel" />
        </TresMesh>
      </template>
      <template v-else>
        <TresMesh :position="[0, g.bot + 0.08 + g.SEAT_H*0.5, -g.hd + g.SEAT_D*0.5]">
          <TresBoxGeometry :args="[g.w, g.SEAT_H, g.SEAT_D]" />
          <TresMeshStandardMaterial :color="item.color" :roughness="0.95" :side="2" v-bind="sel" />
        </TresMesh>
        <TresMesh :position="[0, g.bot + 0.08 + g.BACK_H*0.5, g.hd - g.BACK_D*0.5]">
          <TresBoxGeometry :args="[g.w, g.BACK_H, g.BACK_D]" />
          <TresMeshStandardMaterial :color="item.color" :roughness="0.95" :side="2" v-bind="sel" />
        </TresMesh>
        <TresMesh v-for="(ax, i) in g.armX" :key="`arm${i}`" :position="[ax, g.bot + 0.08 + g.ARM_H*0.5, 0]">
          <TresBoxGeometry :args="[g.ARM_W, g.ARM_H, g.d]" />
          <TresMeshStandardMaterial :color="item.color" :roughness="0.95" :side="2" v-bind="sel" />
        </TresMesh>
      </template>
    </template>

    <!-- ═══ POUF ════════════════════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'pouf'">
      <TresMesh :position="[0, g.bot + g.h*0.12, 0]">
        <TresBoxGeometry :args="[g.w, g.h*0.15, g.d]" />
        <TresMeshStandardMaterial :color="WOOD_D" :roughness="0.7" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + g.h*0.15 + g.h*0.82*0.5, 0]">
        <TresBoxGeometry :args="[g.w*0.95, g.h*0.82, g.d*0.95]" />
        <TresMeshStandardMaterial :color="item.color" :roughness="0.92" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ ARMADIO ═════════════════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'armadio'">
      <TresMesh :position="[0, 0, 0]">
        <TresBoxGeometry :args="[g.w, g.h, g.d]" />
        <TresMeshStandardMaterial color="#f0ede8" :roughness="0.85" :side="2" v-bind="sel" />
      </TresMesh>
      <!-- ante sul lato Z (w ≥ d) -->
      <template v-if="g.doorOnZ">
        <TresMesh v-for="(p, i) in g.doorPos" :key="`door${i}`" :position="[p, 0, -g.hd - 0.008]">
          <TresBoxGeometry :args="[g.doorW - 0.02, g.h - 0.04, 0.016]" />
          <TresMeshStandardMaterial :color="WOOD_L" :roughness="0.8" :side="2" v-bind="sel" />
        </TresMesh>
        <TresMesh v-for="(p, i) in g.doorPos" :key="`hdl${i}`" :position="[p + g.doorW*0.28, 0, -g.hd - 0.022]">
          <TresBoxGeometry :args="[0.01, 0.14, 0.012]" />
          <TresMeshStandardMaterial :color="CHROME" :roughness="0.2" :metalness="0.9" :side="2" v-bind="sel" />
        </TresMesh>
      </template>
      <!-- ante sul lato X (d > w) -->
      <template v-else>
        <TresMesh v-for="(p, i) in g.doorPos" :key="`door${i}`" :position="[-g.hw - 0.008, 0, p]">
          <TresBoxGeometry :args="[0.016, g.h - 0.04, g.doorW - 0.02]" />
          <TresMeshStandardMaterial :color="WOOD_L" :roughness="0.8" :side="2" v-bind="sel" />
        </TresMesh>
        <TresMesh v-for="(p, i) in g.doorPos" :key="`hdl${i}`" :position="[-g.hw - 0.022, 0, p + g.doorW*0.28]">
          <TresBoxGeometry :args="[0.012, 0.14, 0.01]" />
          <TresMeshStandardMaterial :color="CHROME" :roughness="0.2" :metalness="0.9" :side="2" v-bind="sel" />
        </TresMesh>
      </template>
    </template>

    <!-- ═══ CASSETTO / COMODINO / COMÒ ══════════════════════════════════════════ -->
    <template v-else-if="kind === 'cassetto'">
      <TresMesh :position="[0, 0, 0]">
        <TresBoxGeometry :args="[g.w, g.h, g.d]" />
        <TresMeshStandardMaterial color="#f0ede8" :roughness="0.85" :side="2" v-bind="sel" />
      </TresMesh>
      <!-- cassetti sul lato lungo, come le ante degli armadi -->
      <template v-if="g.doorOnZ">
        <TresMesh v-for="(dy, i) in g.drawerY" :key="`dr${i}`" :position="[0, dy, -g.hd - 0.007]">
          <TresBoxGeometry :args="[g.w - 0.03, g.drawerH - 0.015, 0.014]" />
          <TresMeshStandardMaterial :color="WOOD_L" :roughness="0.8" :side="2" v-bind="sel" />
        </TresMesh>
        <TresMesh v-for="(dy, i) in g.drawerY" :key="`hdl${i}`" :position="[0, dy, -g.hd - 0.018]">
          <TresBoxGeometry :args="[0.06, 0.012, 0.012]" />
          <TresMeshStandardMaterial :color="CHROME" :roughness="0.2" :metalness="0.9" :side="2" v-bind="sel" />
        </TresMesh>
      </template>
      <template v-else>
        <TresMesh v-for="(dy, i) in g.drawerY" :key="`dr${i}`" :position="[-g.hw - 0.007, dy, 0]">
          <TresBoxGeometry :args="[0.014, g.drawerH - 0.015, g.d - 0.03]" />
          <TresMeshStandardMaterial :color="WOOD_L" :roughness="0.8" :side="2" v-bind="sel" />
        </TresMesh>
        <TresMesh v-for="(dy, i) in g.drawerY" :key="`hdl${i}`" :position="[-g.hw - 0.018, dy, 0]">
          <TresBoxGeometry :args="[0.012, 0.012, 0.06]" />
          <TresMeshStandardMaterial :color="CHROME" :roughness="0.2" :metalness="0.9" :side="2" v-bind="sel" />
        </TresMesh>
      </template>
    </template>

    <!-- ═══ TAVOLO ══════════════════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'tavolo' || kind === 'scrivania'">
      <TresMesh :position="[0, g.top - g.TOP_H*0.5, 0]">
        <TresBoxGeometry :args="[g.w, g.TOP_H, g.d]" />
        <TresMeshStandardMaterial :color="g.tableColor" :roughness="0.72" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh v-for="([lx,lz], i) in g.legCorners" :key="`leg${i}`"
        :position="[lx, g.bot + (g.h - g.TOP_H)*0.5, lz]">
        <TresBoxGeometry :args="[0.05, g.h - g.TOP_H, 0.05]" />
        <TresMeshStandardMaterial :color="g.tableLegColor" :roughness="0.75" :side="2" v-bind="sel" />
      </TresMesh>
      <template v-if="g.hasDeskDrawer">
        <TresMesh :position="[g.deskDrawerX, g.bot + g.h*0.43, -g.hd + g.d*0.31]">
          <TresBoxGeometry :args="[g.deskDrawerW, g.h*0.56, g.d*0.46]" />
          <TresMeshStandardMaterial color="#eef2f7" :roughness="0.78" :side="2" v-bind="sel" />
        </TresMesh>
        <TresMesh v-for="(dy, i) in g.deskDrawerY" :key="`deskdr${i}`" :position="[g.deskDrawerX, dy, -g.hd + g.d*0.075]">
          <TresBoxGeometry :args="[g.deskDrawerW - 0.035, g.h*0.13, 0.012]" />
          <TresMeshStandardMaterial color="#ffffff" :roughness="0.74" :side="2" v-bind="sel" />
        </TresMesh>
        <TresMesh v-for="(dy, i) in g.deskDrawerY" :key="`deskhdl${i}`" :position="[g.deskDrawerX, dy, -g.hd + g.d*0.055]">
          <TresBoxGeometry :args="[g.deskDrawerW*0.44, 0.01, 0.01]" />
          <TresMeshStandardMaterial :color="CHROME" :roughness="0.2" :metalness="0.85" :side="2" v-bind="sel" />
        </TresMesh>
      </template>
    </template>

    <!-- ═══ SEDIA ═══════════════════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'sedia'">
      <TresMesh v-for="([lx,lz], i) in g.legCorners" :key="`leg${i}`"
        :position="[lx, g.bot + g.LEG_CHAIR*0.5, lz]">
        <TresBoxGeometry :args="[0.03, g.LEG_CHAIR, 0.03]" />
        <TresMeshStandardMaterial :color="g.chairFrameColor" :roughness="0.75" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + g.LEG_CHAIR + g.SEAT_CH*0.5, 0]">
        <TresBoxGeometry :args="[g.w, g.SEAT_CH, g.d]" />
        <TresMeshStandardMaterial :color="g.chairColor" :roughness="0.9" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + g.LEG_CHAIR + g.SEAT_CH + g.BACK_CHAIR*0.5, g.hd - 0.03]">
        <TresBoxGeometry :args="[g.w, g.BACK_CHAIR, 0.04]" />
        <TresMeshStandardMaterial :color="g.chairColor" :roughness="0.9" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ LIBRERIA ════════════════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'libreria'">
      <TresMesh v-for="sx in [-g.hw + 0.02, g.hw - 0.02]" :key="`side${sx}`" :position="[sx, 0, 0]">
        <TresBoxGeometry :args="[0.04, g.h, g.d]" />
        <TresMeshStandardMaterial :color="g.bookcaseColor" :roughness="0.82" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, 0, g.hd - 0.01]">
        <TresBoxGeometry :args="[g.w, g.h, 0.02]" />
        <TresMeshStandardMaterial :color="g.bookcaseColor" :roughness="0.85" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh v-for="(sy, i) in g.shelfY" :key="`sh${i}`" :position="[0, sy, 0]">
        <TresBoxGeometry :args="[g.w - 0.04, 0.025, g.d]" />
        <TresMeshStandardMaterial :color="g.bookcaseColor" :roughness="0.8" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh v-for="(book, i) in g.books" :key="`book${i}`" :position="[book.x, book.y, -g.hd + 0.04]">
        <TresBoxGeometry :args="[book.w, book.h, 0.07]" />
        <TresMeshStandardMaterial :color="book.color" :roughness="0.86" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh v-for="(decor, i) in g.boxDecor" :key="`boxdecor${i}`" :position="[decor.x, decor.y, decor.z]">
        <TresBoxGeometry :args="[decor.w, decor.h, decor.d]" />
        <TresMeshStandardMaterial :color="decor.color" :roughness="0.78" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh v-for="(decor, i) in g.vaseDecor" :key="`vasedecor${i}`" :position="[decor.x, decor.y, decor.z]">
        <TresCylinderGeometry :args="[decor.rTop, decor.rBot, decor.h, 18]" />
        <TresMeshStandardMaterial :color="decor.color" :roughness="0.68" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh v-for="(decor, i) in g.roundDecor" :key="`rounddecor${i}`" :position="[decor.x, decor.y, decor.z]">
        <TresSphereGeometry :args="[decor.r, 18, 12]" />
        <TresMeshStandardMaterial :color="decor.color" :roughness="0.58" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ TAVOLINO ════════════════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'tavolino'">
      <TresMesh :position="[0, g.top - 0.035, 0]">
        <TresBoxGeometry :args="[g.w, 0.04, g.d]" />
        <TresMeshStandardMaterial :color="WOOD_L" :roughness="0.68" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh v-for="([lx,lz], i) in g.legCorners" :key="`leg${i}`"
        :position="[lx, g.bot + (g.h - 0.04)*0.5, lz]">
        <TresBoxGeometry :args="[0.04, g.h - 0.04, 0.04]" />
        <TresMeshStandardMaterial :color="CHROME" :roughness="0.2" :metalness="0.8" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ BLOCCO CUCINA ══════════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'blocco_cucina'">
      <TresMesh :position="[0, 0, 0]">
        <TresBoxGeometry :args="[g.w, g.h, g.d]" />
        <TresMeshStandardMaterial color="#f0ede8" :roughness="0.8" :side="2" v-bind="sel" />
      </TresMesh>
      <!-- ante sul lato Z (w ≥ d) -->
      <template v-if="g.doorOnZ">
        <TresMesh v-for="(p, i) in g.doorPos" :key="`door${i}`" :position="[p, -0.04, -g.hd - 0.006]">
          <TresBoxGeometry :args="[g.doorW - 0.02, g.h*0.88, 0.012]" />
          <TresMeshStandardMaterial color="#e8e4de" :roughness="0.8" :side="2" v-bind="sel" />
        </TresMesh>
        <TresMesh :position="[0, -0.04, -g.hd - 0.016]">
          <TresBoxGeometry :args="[g.w*0.75, 0.012, 0.012]" />
          <TresMeshStandardMaterial :color="CHROME" :roughness="0.2" :metalness="0.9" :side="2" v-bind="sel" />
        </TresMesh>
      </template>
      <!-- ante sul lato X (d > w) -->
      <template v-else>
        <TresMesh v-for="(p, i) in g.doorPos" :key="`door${i}`" :position="[-g.hw - 0.006, -0.04, p]">
          <TresBoxGeometry :args="[0.012, g.h*0.88, g.doorW - 0.02]" />
          <TresMeshStandardMaterial color="#e8e4de" :roughness="0.8" :side="2" v-bind="sel" />
        </TresMesh>
        <TresMesh :position="[-g.hw - 0.016, -0.04, 0]">
          <TresBoxGeometry :args="[0.012, 0.012, g.d*0.75]" />
          <TresMeshStandardMaterial :color="CHROME" :roughness="0.2" :metalness="0.9" :side="2" v-bind="sel" />
        </TresMesh>
      </template>
      <TresMesh :position="[0, g.top + 0.015, 0]">
        <TresBoxGeometry :args="[g.w, 0.03, g.d]" />
        <TresMeshStandardMaterial color="#c8c5be" :roughness="0.35" :metalness="0.05" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ PENSILE CUCINA ═════════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'pensile_cucina'">
      <TresMesh :position="[0, 0, 0]">
        <TresBoxGeometry :args="[g.w, g.h, g.d]" />
        <TresMeshStandardMaterial color="#f0ede8" :roughness="0.8" :side="2" v-bind="sel" />
      </TresMesh>
      <!-- ante sul lato Z (w ≥ d) -->
      <template v-if="g.doorOnZ">
        <TresMesh v-for="(p, i) in g.doorPos" :key="`door${i}`" :position="[p, 0, -g.hd - 0.006]">
          <TresBoxGeometry :args="[g.doorW - 0.02, g.h - 0.03, 0.012]" />
          <TresMeshStandardMaterial color="#e8e4de" :roughness="0.8" :side="2" v-bind="sel" />
        </TresMesh>
        <TresMesh :position="[0, 0, -g.hd - 0.016]">
          <TresBoxGeometry :args="[g.w*0.75, 0.01, 0.01]" />
          <TresMeshStandardMaterial :color="CHROME" :roughness="0.2" :metalness="0.9" :side="2" v-bind="sel" />
        </TresMesh>
      </template>
      <!-- ante sul lato X (d > w) -->
      <template v-else>
        <TresMesh v-for="(p, i) in g.doorPos" :key="`door${i}`" :position="[-g.hw - 0.006, 0, p]">
          <TresBoxGeometry :args="[0.012, g.h - 0.03, g.doorW - 0.02]" />
          <TresMeshStandardMaterial color="#e8e4de" :roughness="0.8" :side="2" v-bind="sel" />
        </TresMesh>
        <TresMesh :position="[-g.hw - 0.016, 0, 0]">
          <TresBoxGeometry :args="[0.01, 0.01, g.d*0.75]" />
          <TresMeshStandardMaterial :color="CHROME" :roughness="0.2" :metalness="0.9" :side="2" v-bind="sel" />
        </TresMesh>
      </template>
    </template>

    <!-- ═══ PIANO COTTURA ══════════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'piano_cottura'">
      <TresMesh :position="[0, 0, 0]">
        <TresBoxGeometry :args="[g.w, g.h, g.d]" />
        <TresMeshStandardMaterial color="#1a1a1a" :roughness="0.25" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh v-for="([bx,bz], i) in g.burners" :key="`b${i}`"
        :position="[bx, g.top + 0.005, bz]">
        <TresCylinderGeometry :args="[0.09, 0.09, 0.01, 16]" />
        <TresMeshStandardMaterial color="#2e2e2e" :roughness="0.5" :metalness="0.3" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ FRIGO ══════════════════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'frigo'">
      <TresMesh :position="[0, 0, 0]">
        <TresBoxGeometry :args="[g.w, g.h, g.d]" />
        <TresMeshStandardMaterial color="#f0ede8" :roughness="0.4" :metalness="0.15" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + g.h*0.3, -g.hd - 0.005]">
        <TresBoxGeometry :args="[g.w - 0.02, g.h*0.54, 0.01]" />
        <TresMeshStandardMaterial color="#e4e0da" :roughness="0.4" :metalness="0.15" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.top - g.h*0.23, -g.hd - 0.005]">
        <TresBoxGeometry :args="[g.w - 0.02, g.h*0.4, 0.01]" />
        <TresMeshStandardMaterial color="#e4e0da" :roughness="0.4" :metalness="0.15" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[g.hw - 0.055, 0, -g.hd - 0.02]">
        <TresBoxGeometry :args="[0.014, g.h*0.5, 0.014]" />
        <TresMeshStandardMaterial :color="CHROME" :roughness="0.2" :metalness="0.9" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ WC ══════════════════════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'wc'">
      <TresMesh :position="[0, g.bot + g.h*0.64, g.hd - g.d*0.13]">
        <TresBoxGeometry :args="[g.w*0.90, g.h*0.40, g.d*0.20]" />
        <TresMeshStandardMaterial :color="CERAMIC" :roughness="0.22" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + g.h*0.23, -g.hd + g.d*0.40]">
        <TresCylinderGeometry :args="[g.w*0.26, g.w*0.34, g.h*0.36, 32]" />
        <TresMeshStandardMaterial :color="CERAMIC" :roughness="0.22" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + g.h*0.47, -g.hd + g.d*0.39]" :rotation="[Math.PI/2, 0, 0]">
        <TresCylinderGeometry :args="[g.w*0.30, g.w*0.36, 0.045, 36]" />
        <TresMeshStandardMaterial :color="CERAMIC" :roughness="0.22" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + g.h*0.50, -g.hd + g.d*0.39]" :rotation="[Math.PI/2, 0, 0]">
        <TresCylinderGeometry :args="[g.w*0.18, g.w*0.22, 0.048, 36]" />
        <TresMeshStandardMaterial color="#a9c6d8" :roughness="0.14" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + g.h*0.36, g.hd - g.d*0.28]">
        <TresBoxGeometry :args="[g.w*0.36, g.h*0.38, g.d*0.16]" />
        <TresMeshStandardMaterial :color="CERAMIC" :roughness="0.22" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.top - g.h*0.08, g.hd - g.d*0.13]">
        <TresBoxGeometry :args="[g.w*0.72, 0.018, g.d*0.16]" />
        <TresMeshStandardMaterial :color="CHROME" :roughness="0.2" :metalness="0.8" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ BIDET ══════════════════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'bidet'">
      <TresMesh :position="[0, g.bot + g.h*0.25, -g.hd + g.d*0.47]">
        <TresCylinderGeometry :args="[g.w*0.25, g.w*0.33, g.h*0.42, 32]" />
        <TresMeshStandardMaterial :color="CERAMIC" :roughness="0.22" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + g.h*0.50, -g.hd + g.d*0.47]" :rotation="[Math.PI/2, 0, 0]">
        <TresCylinderGeometry :args="[g.w*0.27, g.w*0.34, 0.038, 36]" />
        <TresMeshStandardMaterial :color="CERAMIC" :roughness="0.22" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + g.h*0.53, -g.hd + g.d*0.47]" :rotation="[Math.PI/2, 0, 0]">
        <TresCylinderGeometry :args="[g.w*0.15, g.w*0.20, 0.04, 36]" />
        <TresMeshStandardMaterial color="#a9c6d8" :roughness="0.14" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + g.h*0.58, g.hd - g.d*0.16]">
        <TresBoxGeometry :args="[0.028, 0.10, 0.028]" />
        <TresMeshStandardMaterial :color="CHROME" :roughness="0.15" :metalness="0.95" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + g.h*0.65, g.hd - g.d*0.26]">
        <TresBoxGeometry :args="[0.025, 0.018, g.d*0.25]" />
        <TresMeshStandardMaterial :color="CHROME" :roughness="0.2" :metalness="0.9" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ VASCA ══════════════════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'vasca'">
      <TresMesh :position="[0, 0, 0]">
        <TresBoxGeometry :args="[g.w, g.h, g.d]" />
        <TresMeshStandardMaterial color="#f2ede8" :roughness="0.2" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.top - 0.04, 0]">
        <TresBoxGeometry :args="[g.w - 0.1, g.h*0.72, g.d - 0.08]" />
        <TresMeshStandardMaterial color="#cce8f5" :roughness="0.12" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ DOCCIA ═════════════════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'doccia'">
      <TresMesh :position="[0, g.bot + 0.06, 0]">
        <TresBoxGeometry :args="[g.w, 0.12, g.d]" />
        <TresMeshStandardMaterial :color="CERAMIC" :roughness="0.28" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + 0.125, 0]">
        <TresBoxGeometry :args="[g.w*0.82, 0.012, g.d*0.72]" />
        <TresMeshStandardMaterial color="#d8eef8" :roughness="0.08" :transparent="true" :opacity="0.48" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[-g.hw + 0.008, 0, 0]">
        <TresBoxGeometry :args="[0.015, g.h*0.92, g.d]" />
        <TresMeshStandardMaterial color="#c8dff0" :roughness="0.05" :transparent="true" :opacity="0.38" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[g.hw - 0.008, 0, 0]">
        <TresBoxGeometry :args="[0.015, g.h*0.92, g.d]" />
        <TresMeshStandardMaterial color="#c8dff0" :roughness="0.05" :transparent="true" :opacity="0.45" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, 0, g.hd - 0.008]">
        <TresBoxGeometry :args="[g.w, g.h*0.92, 0.015]" />
        <TresMeshStandardMaterial color="#c8dff0" :roughness="0.05" :transparent="true" :opacity="0.38" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, 0, -g.hd + 0.008]">
        <TresBoxGeometry :args="[g.w, g.h*0.92, 0.015]" />
        <TresMeshStandardMaterial color="#c8dff0" :roughness="0.05" :transparent="true" :opacity="0.45" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh v-for="([lx,lz], i) in g.showerPosts" :key="`shpost${i}`" :position="[lx, 0, lz]">
        <TresBoxGeometry :args="[0.025, g.h*0.95, 0.025]" />
        <TresMeshStandardMaterial :color="CHROME" :roughness="0.22" :metalness="0.9" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.top - g.h*0.16, g.hd - 0.025]">
        <TresBoxGeometry :args="[g.w*0.72, 0.018, 0.018]" />
        <TresMeshStandardMaterial :color="CHROME" :roughness="0.22" :metalness="0.9" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[g.hw - 0.06, g.bot + g.h*0.55, g.hd - 0.035]">
        <TresBoxGeometry :args="[0.035, 0.18, 0.018]" />
        <TresMeshStandardMaterial :color="CHROME" :roughness="0.18" :metalness="0.95" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ LAVABO BAGNO ════════════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'lavabo_bagno'">
      <TresMesh :position="[0, bot_off - g.h*0.05, 0]">
        <TresBoxGeometry :args="[g.w, g.h*0.9, g.d]" />
        <TresMeshStandardMaterial color="#eef2f7" :roughness="0.8" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + g.h*0.18, -g.hd - 0.006]">
        <TresBoxGeometry :args="[g.w*0.9, g.h*0.24, 0.012]" />
        <TresMeshStandardMaterial color="#ffffff" :roughness="0.76" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + g.h*0.18, -g.hd - 0.018]">
        <TresBoxGeometry :args="[g.w*0.48, 0.012, 0.012]" />
        <TresMeshStandardMaterial :color="CHROME" :roughness="0.2" :metalness="0.85" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.top - 0.018, 0]">
        <TresBoxGeometry :args="[g.w*0.92, 0.036, g.d*0.82]" />
        <TresMeshStandardMaterial :color="CERAMIC" :roughness="0.18" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh v-for="(px, i) in g.sinkX" :key="`sink${i}`" :position="[px, g.top + 0.004, 0]" :rotation="[Math.PI/2, 0, 0]">
        <TresCylinderGeometry :args="[g.sinkRim, g.sinkRim, 0.028, 32]" />
        <TresMeshStandardMaterial :color="CERAMIC" :roughness="0.16" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh v-for="(px, i) in g.sinkX" :key="`basin${i}`" :position="[px, g.top + 0.022, 0]" :rotation="[Math.PI/2, 0, 0]">
        <TresCylinderGeometry :args="[g.sinkInner, g.sinkInner, 0.032, 32]" />
        <TresMeshStandardMaterial color="#a9c6d8" :roughness="0.12" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh v-for="(px, i) in g.sinkX" :key="`tap${i}`" :position="[px, g.top + 0.075, -g.hd*0.24]">
        <TresBoxGeometry :args="[0.025, 0.1, 0.025]" />
        <TresMeshStandardMaterial :color="CHROME" :roughness="0.15" :metalness="0.95" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh v-for="(px, i) in g.sinkX" :key="`spout${i}`" :position="[px, g.top + 0.13, -g.hd*0.14]">
        <TresBoxGeometry :args="[0.022, 0.018, g.d*0.22]" />
        <TresMeshStandardMaterial :color="CHROME" :roughness="0.15" :metalness="0.95" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ LAVATRICE / ASCIUGATRICE ══════════════════════════════════════════ -->
    <template v-else-if="kind === 'lavatrice'">
      <TresMesh :position="[0, 0, 0]">
        <TresBoxGeometry :args="[g.w, g.h, g.d]" />
        <TresMeshStandardMaterial color="#f0ede8" :roughness="0.5" :metalness="0.1" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, -0.05, -g.hd - 0.005]" :rotation="[Math.PI/2, 0, 0]">
        <TresCylinderGeometry :args="[g.w*0.3, g.w*0.3, 0.012, 24]" />
        <TresMeshStandardMaterial color="#a8c8e0" :roughness="0.1" :transparent="true" :opacity="0.6" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.top - g.h*0.08, -g.hd - 0.005]">
        <TresBoxGeometry :args="[g.w - 0.04, g.h*0.12, 0.01]" />
        <TresMeshStandardMaterial color="#d0d0d0" :roughness="0.6" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ LAMPADA PIANTANA ═══════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'lampada'">
      <TresMesh :position="[0, g.bot + 0.03, 0]">
        <TresCylinderGeometry :args="[g.w*0.38, g.w*0.38, 0.06, 16]" />
        <TresMeshStandardMaterial :color="CHROME" :roughness="0.3" :metalness="0.8" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, 0, 0]">
        <TresBoxGeometry :args="[0.025, g.h*0.85, 0.025]" />
        <TresMeshStandardMaterial :color="CHROME" :roughness="0.3" :metalness="0.8" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.top - g.h*0.12, 0]">
        <TresCylinderGeometry :args="[g.w*0.32, g.w*0.44, g.h*0.26, 16]" />
        <TresMeshStandardMaterial color="#f5e8c0" :roughness="0.88" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ TV A MURO ══════════════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'tv_muro'">
      <TresMesh :position="[0, 0, 0]">
        <TresBoxGeometry :args="[g.w, g.h, g.d]" />
        <TresMeshStandardMaterial color="#1a1a1a" :roughness="0.5" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, 0, -g.hd - 0.001]">
        <TresBoxGeometry :args="[g.w - 0.028, g.h - 0.022, 0.002]" />
        <TresMeshStandardMaterial color="#080c12" :roughness="0.08" :metalness="0.2" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ MOBILE TV ══════════════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'tv_stand'">
      <TresMesh :position="[0, 0, 0]">
        <TresBoxGeometry :args="[g.w, g.h, g.d]" />
        <TresMeshStandardMaterial color="#374151" :roughness="0.72" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh v-for="(dx, i) in g.doorX" :key="`door${i}`" :position="[dx, 0, -g.hd - 0.006]">
        <TresBoxGeometry :args="[g.doorW - 0.02, g.h - 0.03, 0.012]" />
        <TresMeshStandardMaterial color="#4b5563" :roughness="0.72" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.top - g.h*0.18, -g.hd - 0.018]">
        <TresBoxGeometry :args="[g.w*0.82, 0.012, 0.012]" />
        <TresMeshStandardMaterial color="#111827" :roughness="0.38" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh v-for="lx in [-g.hw + 0.1, g.hw - 0.1]" :key="`ft${lx}`"
        :position="[lx, g.bot + 0.025, 0]">
        <TresBoxGeometry :args="[0.12, 0.05, g.d - 0.04]" />
        <TresMeshStandardMaterial :color="CHROME" :roughness="0.3" :metalness="0.7" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ MADIA / CONSOLLE / SCARPIERA ═══════════════════════════════════════ -->
    <template v-else-if="kind === 'madia'">
      <TresMesh :position="[0, 0, 0]">
        <TresBoxGeometry :args="[g.w, g.h, g.d]" />
        <TresMeshStandardMaterial :color="WOOD_D" :roughness="0.8" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh v-for="(dx, i) in g.doorX" :key="`door${i}`" :position="[dx, -g.h*0.08, -g.hd - 0.007]">
        <TresBoxGeometry :args="[g.doorW - 0.02, g.h*0.78, 0.014]" />
        <TresMeshStandardMaterial :color="WOOD_L" :roughness="0.75" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.top + 0.013, 0]">
        <TresBoxGeometry :args="[g.w, 0.025, g.d]" />
        <TresMeshStandardMaterial :color="WOOD_L" :roughness="0.68" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ PIANTA ═════════════════════════════════════════════════════════════ -->
    <template v-else-if="kind === 'pianta'">
      <TresMesh :position="[0, g.bot + g.h*0.13, 0]">
        <TresCylinderGeometry :args="[g.w*0.26, g.w*0.2, g.h*0.26, 12]" />
        <TresMeshStandardMaterial color="#8b6f5a" :roughness="0.9" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[0, g.bot + g.h*0.56, 0]">
        <TresSphereGeometry :args="[g.w*0.4, 10, 10]" />
        <TresMeshStandardMaterial color="#3a7d44" :roughness="0.95" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[g.w*0.18, g.bot + g.h*0.68, g.d*0.12]">
        <TresSphereGeometry :args="[g.w*0.28, 8, 8]" />
        <TresMeshStandardMaterial color="#4a9455" :roughness="0.95" :side="2" v-bind="sel" />
      </TresMesh>
      <TresMesh :position="[-g.w*0.16, g.bot + g.h*0.65, -g.d*0.1]">
        <TresSphereGeometry :args="[g.w*0.26, 8, 8]" />
        <TresMeshStandardMaterial color="#2d6e38" :roughness="0.95" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ LETTO A SOPPALCO CON ARMADIO A PONTE ════════════════════════════ -->
    <template v-else-if="kind === 'soppalco'">
      <!-- Back wardrobe cabinet (full height) -->
      <TresMesh :position="[0, 0, g.wardrobeZc]">
        <TresBoxGeometry :args="[g.w, g.h, g.wardrobeD]" />
        <TresMeshStandardMaterial color="#f0ede8" :roughness="0.85" :side="2" v-bind="sel" />
      </TresMesh>
      <!-- Wardrobe doors (2) on front Z face -->
      <TresMesh v-for="(px, i) in [-g.hw * 0.5, g.hw * 0.5]" :key="`wdoor${i}`"
        :position="[px, 0, g.bedStart + 0.008]">
        <TresBoxGeometry :args="[g.w * 0.48, g.h - 0.04, 0.016]" />
        <TresMeshStandardMaterial :color="WOOD_L" :roughness="0.8" :side="2" v-bind="sel" />
      </TresMesh>
      <!-- 2 front posts at foot of bed -->
      <TresMesh v-for="px in [-g.hw + 0.04, g.hw - 0.04]" :key="`post${px}`"
        :position="[px, 0, g.hd - 0.04]">
        <TresBoxGeometry :args="[0.06, g.h, 0.06]" />
        <TresMeshStandardMaterial :color="WOOD_D" :roughness="0.75" :side="2" v-bind="sel" />
      </TresMesh>
      <!-- Overhead bridge cabinet (armadio a ponte) -->
      <TresMesh :position="[0, g.top - g.bridgeH * 0.5, g.bedZc]">
        <TresBoxGeometry :args="[g.w, g.bridgeH, g.bedL]" />
        <TresMeshStandardMaterial color="#f0ede8" :roughness="0.8" :side="2" v-bind="sel" />
      </TresMesh>
      <!-- Bridge front door panel -->
      <TresMesh :position="[0, g.top - g.bridgeH * 0.5, g.hd + 0.008]">
        <TresBoxGeometry :args="[g.w - 0.04, g.bridgeH - 0.04, 0.016]" />
        <TresMeshStandardMaterial :color="WOOD_L" :roughness="0.8" :side="2" v-bind="sel" />
      </TresMesh>
      <!-- Bed frame -->
      <TresMesh :position="[0, g.bot + g.FRAME * 0.5, g.bedZc]">
        <TresBoxGeometry :args="[g.w * 0.9, g.FRAME, g.bedL * 0.9]" />
        <TresMeshStandardMaterial :color="WOOD_L" :roughness="0.78" :side="2" v-bind="sel" />
      </TresMesh>
      <!-- Mattress -->
      <TresMesh :position="[0, g.bot + g.FRAME + g.MATT * 0.5, g.bedZc]">
        <TresBoxGeometry :args="[g.w * 0.87, g.MATT, g.bedL * 0.9 - 0.05]" />
        <TresMeshStandardMaterial color="#f2ede8" :roughness="0.95" :side="2" v-bind="sel" />
      </TresMesh>
      <!-- Pillow -->
      <TresMesh :position="[0, g.bot + g.FRAME + g.MATT + 0.06, g.bedStart + 0.25]">
        <TresBoxGeometry :args="[g.w * 0.70, 0.12, 0.40]" />
        <TresMeshStandardMaterial color="#f8f4ee" :roughness="0.9" :side="2" v-bind="sel" />
      </TresMesh>
      <!-- Headboard panel -->
      <TresMesh :position="[0, g.bot + 0.45, g.bedStart + 0.04]">
        <TresBoxGeometry :args="[g.w * 0.92, 0.9, 0.05]" />
        <TresMeshStandardMaterial :color="WOOD_L" :roughness="0.75" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

    <!-- ═══ FALLBACK ═══════════════════════════════════════════════════════════ -->
    <template v-else>
      <TresMesh>
        <TresBoxGeometry :args="[g.w, g.h, g.d]" />
        <TresMeshStandardMaterial :color="item.color" :roughness="0.85" :side="2" v-bind="sel" />
      </TresMesh>
    </template>

  </TresGroup>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watchEffect } from 'vue'
import type { PlacedFurniture } from '../types'

const props = defineProps<{ item: PlacedFurniture; selected: boolean }>()
const modelRef = ref<any | null>(null)

watchEffect(() => {
  const model = modelRef.value
  if (!model?.traverse) return
  nextTick(() => {
    model.traverse((obj: any) => {
      if (!obj.isMesh) return
      obj.castShadow = true
      obj.receiveShadow = true
    })
  })
})

// ─── Palette ────────────────────────────────────────────────────────────────
const WOOD_L  = '#d4a96a'
const WOOD_D  = '#7d5a3c'
const CHROME  = '#b8bbb8'
const CERAMIC = '#e8e4df'

// ─── Selection highlight ────────────────────────────────────────────────────
const sel = computed(() => props.selected
  ? { emissive: '#1d4ed8', emissiveIntensity: 0.25 }
  : { emissive: '#000000', emissiveIntensity: 0 }
)

// ─── Kind detection ──────────────────────────────────────────────────────────
function getKind(id: string): string {
  if (id === 'letto_a_soppalco')      return 'soppalco'
  if (id.startsWith('letto_'))        return 'letto'
  if (id.startsWith('divano_'))       return 'divano'
  if (id === 'poltrona' || id === 'poltrona_relax') return 'poltrona'
  if (id === 'pouf')                  return 'pouf'
  if (id.startsWith('armadio') || id === 'cabina_armadio') return 'armadio'
  if (id.startsWith('comodino') || id.startsWith('como_') || id === 'cassettiera') return 'cassetto'
  if (id.startsWith('scrivania'))     return 'scrivania'
  if (id.startsWith('libreria') || id === 'mensola') return 'libreria'
  if (id.startsWith('tavolo_') || id === 'panca') return 'tavolo'
  if (id.startsWith('sedia'))         return 'sedia'
  if (id.startsWith('blocco_cucina') || id === 'cucina_isola' || id.startsWith('lavello_') || id === 'lavastoviglie' || id === 'forno') return 'blocco_cucina'
  if (id.startsWith('pensile_cucina')) return 'pensile_cucina'
  if (id.startsWith('piano_cottura')) return 'piano_cottura'
  if (id.startsWith('frigo'))         return 'frigo'
  if (id === 'wc')                    return 'wc'
  if (id === 'bidet')                 return 'bidet'
  if (id.startsWith('vasca'))         return 'vasca'
  if (id.startsWith('doccia'))        return 'doccia'
  if (id === 'lavabo' || id === 'lavabo_doppio' || id === 'mobile_bagno') return 'lavabo_bagno'
  if (id === 'lavatrice' || id === 'asciugatrice') return 'lavatrice'
  if (id.startsWith('lampada_') || id === 'abat_jour') return 'lampada'
  if (id === 'tv_piccola' || id === 'tv_media' || id === 'tv_grande' || id === 'tv_molto_grande') return 'tv_muro'
  if (id.startsWith('tv_stand'))      return 'tv_stand'
  if (id.startsWith('tavolino'))      return 'tavolino'
  if (id === 'madia' || id === 'consolle' || id === 'scarpiera') return 'madia'
  if (id.startsWith('pianta_') || id === 'vaso_lungo') return 'pianta'
  return 'box'
}

const kind = computed(() => getKind(props.item.catalogId))

// ─── Geometry helpers (all reactive via computed) ────────────────────────────
const g = computed(() => {
  // Recover original (pre-swap) dimensions: rotateFurniture swaps w↔d at 90°/270°
  const rot = props.item.rotation ?? 0
  const is90or270 = rot === 90 || rot === 270
  const w = is90or270 ? props.item.d : props.item.w
  const d = is90or270 ? props.item.w : props.item.d
  const { h } = props.item
  const hw = w / 2, hd = d / 2, hh = h / 2
  const bot = -hh, top = hh

  // Bed
  const LEG   = Math.min(0.10, h * 0.12)
  const FRAME = Math.min(0.18, h * 0.22)
  const MATT  = Math.min(0.24, h - LEG - FRAME - 0.05)
  const pillows  = w > 1.3 ? [-w * 0.22, w * 0.22] : [0]
  const pillowW  = w > 1.3 ? w * 0.42 : w * 0.72

  // Sofa
  const SEAT_H = h * 0.50
  const SEAT_D = d * 0.62
  const BACK_H = h
  const BACK_D = d * 0.38
  const ARM_W  = Math.min(0.12, w * 0.08)
  const ARM_H  = h * 0.78
  const armX   = [-hw + ARM_W * 0.5, hw - ARM_W * 0.5]
  const doubleChaise = props.item.catalogId === 'divano_liberty'
  const sofaColor = doubleChaise ? '#d8c3a5' : props.item.color
  const chaiseW = Math.max(0.55, w * 0.28)
  const chaiseD = Math.max(SEAT_D, d - BACK_D * 0.55)
  const middleSeatW = Math.max(0.4, w - chaiseW * 2)
  const chaiseX = [-hw + ARM_W + chaiseW * 0.5, hw - ARM_W - chaiseW * 0.5]
  const sofaPillowX = [-w * 0.30, -w * 0.10, w * 0.10, w * 0.30]
  const pillowSofaW = Math.min(0.42, w * 0.16)

  // Table/desk
  const TOP_H = Math.min(0.05, h * 0.07)
  const isWhiteDining = props.item.catalogId.startsWith('tavolo_') || props.item.catalogId.startsWith('sedia')
  const hasDeskDrawer = props.item.catalogId === 'scrivania_studio' || props.item.catalogId === 'scrivania_angolare_studio'
  const isWhiteDesk = props.item.catalogId.startsWith('scrivania_studio') || props.item.catalogId === 'scrivania_angolare_studio' || props.item.catalogId === 'scrivania_standing'
  const tableColor = isWhiteDining || isWhiteDesk ? '#f8fafc' : WOOD_L
  const tableLegColor = isWhiteDining || isWhiteDesk ? '#e5e7eb' : WOOD_D
  const deskDrawerW = Math.min(0.36, w * 0.28)
  const deskDrawerX = hw - deskDrawerW * 0.65
  const deskDrawerY = [
    bot + h * 0.28,
    bot + h * 0.43,
    bot + h * 0.58,
  ]

  // Chair
  const LEG_CHAIR  = Math.min(0.38, h * 0.44)
  const SEAT_CH    = Math.min(0.06, h * 0.1)
  const BACK_CHAIR = h - LEG_CHAIR - SEAT_CH
  const chairFrameColor = props.item.catalogId === 'sedia' || props.item.catalogId === 'sedia_con_braccioli'
    ? '#e5e7eb'
    : WOOD_D
  const chairColor = props.item.catalogId === 'sedia' || props.item.catalogId === 'sedia_con_braccioli'
    ? '#f8fafc'
    : props.item.color

  // Doors — sempre sul lato con la dimensione orizzontale MAGGIORE (indipendente dalla rotazione)
  const doorOnZ  = w >= d                          // true → ante sulla faccia Z (larga w); false → sulla faccia X (larga d)
  const doorFace = Math.max(w, d)                  // dimensione del lato con le ante
  const numDoors = doorFace > 2.0 ? 3 : doorFace > 1.2 ? 2 : 1
  const doorW    = doorFace / numDoors
  const doorPos  = Array.from({ length: numDoors }, (_, i) => -doorFace / 2 + doorW * (i + 0.5))
  const doorX    = doorPos                         // alias per compatibilità (usato da tv_stand / madia)

  // Drawers
  const numDrawers = Math.max(2, Math.round(h / 0.18))
  const drawerH    = h / numDrawers
  const drawerY    = Array.from({ length: numDrawers }, (_, i) => bot + drawerH * (i + 0.5))

  // Bookcase shelves
  const numShelves = Math.max(2, Math.round(h / 0.35))
  const shelfY     = Array.from({ length: numShelves }, (_, i) => bot + h * ((i + 1) / (numShelves + 1)))
  const bookcaseColor = '#f8fafc'
  const bookColors = ['#475569', '#6b7280', '#7c6f64', '#8a7967', '#64748b', '#596b5f', '#7a5f52', '#4b5563']
  const isShelf = props.item.catalogId === 'mensola'
  const usableShelves = isShelf ? 1 : numShelves
  const shelfBookCount = isShelf ? Math.max(3, Math.floor(w / 0.18)) : Math.max(4, Math.floor(w / 0.12))
  const books = Array.from({ length: Math.min(isShelf ? 8 : 42, usableShelves * shelfBookCount) }, (_, i) => {
    const shelf = Math.floor(i / shelfBookCount)
    const slot = i % shelfBookCount
    const bookW = 0.045 + (i % 3) * 0.012
    const bookH = isShelf ? 0.18 + (i % 3) * 0.025 : Math.min(0.24, h * (0.07 + (i % 4) * 0.008))
    const shelfBaseY = isShelf ? top + 0.012 : bot + h * ((shelf + 1) / (numShelves + 1))
    return {
      x: -hw + 0.08 + slot * Math.max(0.07, (w - 0.18) / shelfBookCount),
      y: shelfBaseY + bookH / 2 + 0.018,
      w: bookW,
      h: bookH,
      color: bookColors[i % bookColors.length],
    }
  }).filter(book => book.x < hw - 0.06 && (isShelf || book.y < top - 0.04))
  const decorBaseY = isShelf ? top + 0.02 : bot + h * (2 / (numShelves + 1)) + 0.02
  const upperDecorBaseY = isShelf ? top + 0.02 : bot + h * (Math.min(numShelves, 4) / (numShelves + 1)) + 0.02
  const frontZ = -hd + (isShelf ? d * 0.42 : 0.07)
  const boxDecor = [
    { x: hw - 0.18, y: decorBaseY + 0.035, z: frontZ, w: 0.16, h: 0.07, d: 0.10, color: '#e7d8bd' },
    { x: -hw + 0.22, y: upperDecorBaseY + 0.03, z: frontZ, w: 0.18, h: 0.06, d: 0.09, color: '#cbd5e1' },
  ].filter(decor => decor.x > -hw + 0.05 && decor.x < hw - 0.05 && decor.y < top + (isShelf ? 0.35 : 0))
  const vaseDecor = [
    { x: isShelf ? 0 : hw - 0.26, y: upperDecorBaseY + 0.07, z: frontZ, rTop: 0.035, rBot: 0.05, h: 0.14, color: '#94a3b8' },
    { x: -hw + 0.12, y: decorBaseY + 0.055, z: frontZ, rTop: 0.028, rBot: 0.04, h: 0.11, color: '#86a873' },
  ].filter(decor => decor.x > -hw + 0.05 && decor.x < hw - 0.05 && decor.y < top + (isShelf ? 0.35 : 0))
  const roundDecor = [
    { x: hw - 0.10, y: upperDecorBaseY + 0.055, z: frontZ, r: 0.055, color: '#f8c471' },
    { x: -hw + 0.34, y: decorBaseY + 0.04, z: frontZ, r: 0.04, color: '#67e8f9' },
  ].filter(decor => decor.x > -hw + 0.05 && decor.x < hw - 0.05 && decor.y < top + (isShelf ? 0.35 : 0))

  // Cooktop burners
  const bw = w * 0.3, bd = d * 0.28
  const burners: [number, number][] = [[-bw, -bd], [bw, -bd], [-bw, bd], [bw, bd]]

  // Leg corners (offset inward)
  const off = 0.03
  const legCorners: [number, number][] = [
    [-hw + off, -hd + off], [hw - off, -hd + off],
    [-hw + off,  hd - off], [hw - off,  hd - off],
  ]
  const showerPosts: [number, number][] = [
    [-hw + 0.02, -hd + 0.02], [hw - 0.02, -hd + 0.02],
    [-hw + 0.02,  hd - 0.02], [hw - 0.02,  hd - 0.02],
  ]

  // Bathroom sinks
  const sinkCount = props.item.catalogId === 'lavabo_doppio' ? 2 : 1
  const sinkX = sinkCount === 2 ? [-w * 0.25, w * 0.25] : [0]
  const sinkRim = Math.min(w / (sinkCount === 2 ? 5.4 : 3.4), d * 0.27)
  const sinkInner = sinkRim * 0.68

  // Letto a soppalco con armadio a ponte
  const wardrobeD  = Math.min(0.6, d * 0.22)
  const wardrobeZc = -hd + wardrobeD / 2
  const bedStart   = -hd + wardrobeD
  const bedL       = Math.max(0.1, d - wardrobeD)
  const bedZc      = bedStart + bedL / 2
  const bridgeH    = Math.min(0.65, h * 0.28)

  return {
    w, d, h, hw, hd, hh, bot, top,
    LEG, FRAME, MATT, pillows, pillowW,
    SEAT_H, SEAT_D, BACK_H, BACK_D, ARM_W, ARM_H, armX,
    doubleChaise, sofaColor, chaiseW, chaiseD, middleSeatW, chaiseX, sofaPillowX, pillowSofaW,
    TOP_H, tableColor, tableLegColor, hasDeskDrawer, deskDrawerW, deskDrawerX, deskDrawerY,
    LEG_CHAIR, SEAT_CH, BACK_CHAIR, chairFrameColor, chairColor,
    doorOnZ, doorFace, numDoors, doorW, doorPos, doorX,
    numDrawers, drawerH, drawerY,
    numShelves, shelfY, bookcaseColor, books, boxDecor, vaseDecor, roundDecor,
    burners, legCorners, showerPosts,
    sinkCount, sinkX, sinkRim, sinkInner,
    wardrobeD, wardrobeZc, bedStart, bedL, bedZc, bridgeH,
  }
})

// Y rotation in radians — matches 2D rotation (rotateFurniture increments by 90°)
const rotY = computed(() => (props.item.rotation ?? 0) * Math.PI / 180)

// Position: center of bounding box elevated at correct height
const pos = computed((): [number, number, number] => [
  props.item.x,
  (props.item.elevation ?? 0) + props.item.h / 2,
  props.item.z,
])

// Used in lavabo_bagno template (needs local offset)
const bot_off = computed(() => -props.item.h / 2)
</script>
