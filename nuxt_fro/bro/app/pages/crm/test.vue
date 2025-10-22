<script setup lang="ts">
import {useToast} from "vue-toastification"
import {ref} from "vue";

definePageMeta({
  layout: 'crm-layout',
})

const toast = useToast()

interface CellPos {
  ri: number
  ci: number
}

interface rangeMap {
  product: {
    start: CellPos
    end: CellPos,
  }
}

const spreadsheetInstance = ref(null)
const selectionMode = ref(false)
const selectedFile = ref(null)
const rangeMap = ref<rangeMap>({
  product: {
    start: { ri: 0, ci: 0 },
    end: { ri: 0, ci: 0 },
  },
})

onMounted(async () => {
  if (typeof window === 'undefined') return

  try {
    const mod = await import('x-data-spreadsheet')
    const Spreadsheet = mod.default || mod

    const el = document.getElementById('x-spreadsheet-demo')
    if (!el) {
      console.error('id "x-spreadsheet-demo" を持つ要素が見つかりません。')
      return
    }

    // 第2引数にオプション
    const s = new Spreadsheet(el, {
      mode: 'read', // edit | read (編集するわけではないから、選択だけできれば良いと思ってる)
      showToolbar: false, // trueする必要はない(previewだから)
      showGrid: true,
      showContextmenu: false,
      view: {
      },
      row: {
        len: 100,
        height: 25,
      },
      col: {
        len: 26,
        width: 100,
        indexWidth: 60,
        minWidth: 60,
      },
    })

    s.loadData({})

    if (typeof s.change === 'function') {
      s.change((data) => {
        console.log('スプレッドシートが変更されました。')
      })
    }
    /**
     * セルが選択された時の処理
     * @param {Object} cell - セルの情報(値)。空セルの場合はundefined
     * @param {number} ri - 行番号(row index)
     * @param {number} ci - 列番号(column index)
     */
    if (typeof s.on === 'function') {
      s.on('cells-selected', (cell, { sri, sci, eri, eci }) => {
        console.log("選択されたセル", cell)
        console.log("開始行(sri)", sri)
        console.log("開始列(sci)", sci)
        console.log("終了行(eri)", eri)
        console.log("終了列(eci)", eci)
      })
      s.on('cell-selected', (cell, ri, ci) => {
        if (selectionMode.value) {
          console.log("行", ri)
          rangeMap.value.product.start.ri = ri
          rangeMap.value.product.start.ci = ci
          selectionMode.value = false
        }
      })
    }

    spreadsheetInstance.value = s
  } catch (error) {
    console.log('x-data-spreadsheetがロードできなかった', error)
  }
})

const toggleSelecting = () => {
  selectionMode.value = !selectionMode.value
  if (selectionMode.value) {
    console.log("選択モード On")
  } else {
    console.log("選択モード Off")
  }
}

// 現在はxlsxをアップロードするようにしているが、作るときの動きとしてはDBから受け取る形
const handleFileChange = async (event: Event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    await loadExcelFile(file)
  }
}

const loadExcelFile = async (file) => {
  if (!file) {
    console.error('ファイルがありません')
    return
  }

  if (!spreadsheetInstance.value) {
    console.error('spreadsheetInstanceがありません')
    return
  }

  try {
    const XLSX = await import('xlsx')
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]

    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    const cellsData = {}
    rows.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        if (cell !== undefined && cell !== null) {
          if (!cellsData[ri]) cellsData[ri] = {}
          cellsData[ri][ci] = { text: String(cell) }
        }
      })
    })

    const rowsObj = {}
    for (const ri in cellsData) {
      rowsObj[ri] = { cells: cellsData[ri] }
    }

    const data = [{
      name: firstSheetName,
      freeze: 'A1',
      rows: {
        len: rows.length,
        ...rowsObj
      },
      cols: {
        len: Math.max(...rows.map(row => row.length || 0), 26)
      }
    }]

    spreadsheetInstance.value.loadData(data)
  } catch (error) {
    console.error('ファイル読み込みエラー:', error)
    toast.error('ファイルの読み込みに失敗しました')
  }
}
</script>

<template>
  <div>
    <div class="container">
      <div class="header">
        <div class="header-left">テスト</div>
      </div>
      <div class="test">
        <div class="select-sell">
          <input type="file" @change="handleFileChange" accept=".xlsx" class="select-sell-input">
          <p>製品名を入れるセルの範囲選択</p>
          <button @click="toggleSelecting">
            {{ selectionMode ? '選択モード終了' : '選択モード開始' }}
          </button>
          <p>選択されたセル: {{ rangeMap.product.start }}</p>
        </div>
        <div id="x-spreadsheet-demo" class="testa"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test {
  margin: auto auto;
}
</style>