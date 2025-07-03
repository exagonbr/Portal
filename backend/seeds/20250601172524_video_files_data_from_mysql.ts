/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: video_file -> video_files
 * Gerado em: 2025-06-01T17:25:24.854Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('video_files').del();

  // Insere dados de exemplo do MySQL
  await knex('video_files').insert([
    {
        "video_files_id": 142,
        "file_id": 518,
        "id": 24
    },
    {
        "video_files_id": 138,
        "file_id": 522,
        "id": 140
    },
    {
        "video_files_id": 139,
        "file_id": 514,
        "id": 144
    },
    {
        "video_files_id": 140,
        "file_id": 513,
        "id": 149
    },
    {
        "video_files_id": 141,
        "file_id": 516,
        "id": 152
    },
    {
        "video_files_id": 144,
        "file_id": 520,
        "id": 155
    },
    {
        "video_files_id": 144,
        "file_id": 526,
        "id": 158
    },
    {
        "video_files_id": 144,
        "file_id": 523,
        "id": 161
    },
    {
        "video_files_id": 143,
        "file_id": 2329,
        "id": 771
    },
    {
        "video_files_id": 143,
        "file_id": 2330,
        "id": 773
    },
    {
        "video_files_id": 138,
        "file_id": 2334,
        "id": 776
    },
    {
        "video_files_id": 113,
        "file_id": 1186,
        "id": 1336
    },
    {
        "video_files_id": 113,
        "file_id": 2299,
        "id": 1337
    },
    {
        "video_files_id": 453,
        "file_id": 2321,
        "id": 1338
    },
    {
        "video_files_id": 453,
        "file_id": 1103,
        "id": 1339
    },
    {
        "video_files_id": 110,
        "file_id": 354,
        "id": 1367
    },
    {
        "video_files_id": 110,
        "file_id": 2296,
        "id": 1368
    },
    {
        "video_files_id": 349,
        "file_id": 2116,
        "id": 1522
    },
    {
        "video_files_id": 349,
        "file_id": 978,
        "id": 1523
    },
    {
        "video_files_id": 277,
        "file_id": 937,
        "id": 1630
    },
    {
        "video_files_id": 277,
        "file_id": 2045,
        "id": 1631
    },
    {
        "video_files_id": 278,
        "file_id": 2044,
        "id": 1632
    },
    {
        "video_files_id": 278,
        "file_id": 936,
        "id": 1633
    },
    {
        "video_files_id": 275,
        "file_id": 2041,
        "id": 1634
    },
    {
        "video_files_id": 275,
        "file_id": 933,
        "id": 1635
    },
    {
        "video_files_id": 276,
        "file_id": 2043,
        "id": 1636
    },
    {
        "video_files_id": 276,
        "file_id": 935,
        "id": 1637
    },
    {
        "video_files_id": 274,
        "file_id": 934,
        "id": 1638
    },
    {
        "video_files_id": 274,
        "file_id": 2042,
        "id": 1639
    },
    {
        "video_files_id": 244,
        "file_id": 913,
        "id": 1702
    },
    {
        "video_files_id": 244,
        "file_id": 2011,
        "id": 1703
    },
    {
        "video_files_id": 542,
        "file_id": 1952,
        "id": 2294
    },
    {
        "video_files_id": 542,
        "file_id": 1436,
        "id": 2295
    },
    {
        "video_files_id": 544,
        "file_id": 1409,
        "id": 2296
    },
    {
        "video_files_id": 544,
        "file_id": 1954,
        "id": 2297
    },
    {
        "video_files_id": 543,
        "file_id": 1953,
        "id": 2298
    },
    {
        "video_files_id": 543,
        "file_id": 1410,
        "id": 2299
    },
    {
        "video_files_id": 545,
        "file_id": 1957,
        "id": 2300
    },
    {
        "video_files_id": 545,
        "file_id": 1411,
        "id": 2301
    },
    {
        "video_files_id": 546,
        "file_id": 1408,
        "id": 2302
    },
    {
        "video_files_id": 546,
        "file_id": 1956,
        "id": 2303
    },
    {
        "video_files_id": 126,
        "file_id": 383,
        "id": 2729
    },
    {
        "video_files_id": 126,
        "file_id": 2088,
        "id": 2730
    },
    {
        "video_files_id": 127,
        "file_id": 2087,
        "id": 2731
    },
    {
        "video_files_id": 127,
        "file_id": 410,
        "id": 2732
    },
    {
        "video_files_id": 49,
        "file_id": 382,
        "id": 2733
    },
    {
        "video_files_id": 49,
        "file_id": 2084,
        "id": 2734
    },
    {
        "video_files_id": 125,
        "file_id": 381,
        "id": 2735
    },
    {
        "video_files_id": 125,
        "file_id": 2085,
        "id": 2736
    },
    {
        "video_files_id": 128,
        "file_id": 2086,
        "id": 2737
    },
    {
        "video_files_id": 128,
        "file_id": 380,
        "id": 2738
    },
    {
        "video_files_id": 48,
        "file_id": 379,
        "id": 2739
    },
    {
        "video_files_id": 48,
        "file_id": 2083,
        "id": 2740
    },
    {
        "video_files_id": 63,
        "file_id": 1876,
        "id": 2749
    },
    {
        "video_files_id": 63,
        "file_id": 264,
        "id": 2750
    },
    {
        "video_files_id": 62,
        "file_id": 1878,
        "id": 2751
    },
    {
        "video_files_id": 62,
        "file_id": 263,
        "id": 2752
    },
    {
        "video_files_id": 78,
        "file_id": 1874,
        "id": 2753
    },
    {
        "video_files_id": 78,
        "file_id": 268,
        "id": 2754
    },
    {
        "video_files_id": 64,
        "file_id": 1877,
        "id": 2755
    },
    {
        "video_files_id": 64,
        "file_id": 265,
        "id": 2756
    },
    {
        "video_files_id": 65,
        "file_id": 266,
        "id": 2757
    },
    {
        "video_files_id": 65,
        "file_id": 1875,
        "id": 2758
    },
    {
        "video_files_id": 61,
        "file_id": 1879,
        "id": 2759
    },
    {
        "video_files_id": 61,
        "file_id": 262,
        "id": 2760
    },
    {
        "video_files_id": 451,
        "file_id": 1107,
        "id": 2824
    },
    {
        "video_files_id": 451,
        "file_id": 2323,
        "id": 2825
    },
    {
        "video_files_id": 441,
        "file_id": 2312,
        "id": 2826
    },
    {
        "video_files_id": 441,
        "file_id": 1096,
        "id": 2827
    },
    {
        "video_files_id": 445,
        "file_id": 2316,
        "id": 2828
    },
    {
        "video_files_id": 445,
        "file_id": 1099,
        "id": 2829
    },
    {
        "video_files_id": 447,
        "file_id": 2314,
        "id": 2830
    },
    {
        "video_files_id": 447,
        "file_id": 1095,
        "id": 2831
    },
    {
        "video_files_id": 444,
        "file_id": 1098,
        "id": 2832
    },
    {
        "video_files_id": 444,
        "file_id": 2315,
        "id": 2833
    },
    {
        "video_files_id": 450,
        "file_id": 2324,
        "id": 2834
    },
    {
        "video_files_id": 450,
        "file_id": 1108,
        "id": 2835
    },
    {
        "video_files_id": 439,
        "file_id": 2309,
        "id": 2836
    },
    {
        "video_files_id": 439,
        "file_id": 1092,
        "id": 2837
    },
    {
        "video_files_id": 442,
        "file_id": 1094,
        "id": 2838
    },
    {
        "video_files_id": 442,
        "file_id": 2311,
        "id": 2839
    },
    {
        "video_files_id": 117,
        "file_id": 1086,
        "id": 2840
    },
    {
        "video_files_id": 117,
        "file_id": 2302,
        "id": 2841
    },
    {
        "video_files_id": 443,
        "file_id": 1097,
        "id": 2842
    },
    {
        "video_files_id": 443,
        "file_id": 2313,
        "id": 2843
    },
    {
        "video_files_id": 449,
        "file_id": 1106,
        "id": 2844
    },
    {
        "video_files_id": 449,
        "file_id": 2320,
        "id": 2845
    },
    {
        "video_files_id": 455,
        "file_id": 1104,
        "id": 2846
    },
    {
        "video_files_id": 455,
        "file_id": 2325,
        "id": 2847
    },
    {
        "video_files_id": 448,
        "file_id": 1102,
        "id": 2848
    },
    {
        "video_files_id": 448,
        "file_id": 2318,
        "id": 2849
    },
    {
        "video_files_id": 115,
        "file_id": 365,
        "id": 2850
    },
    {
        "video_files_id": 115,
        "file_id": 2301,
        "id": 2851
    },
    {
        "video_files_id": 454,
        "file_id": 2322,
        "id": 2852
    },
    {
        "video_files_id": 454,
        "file_id": 1105,
        "id": 2853
    },
    {
        "video_files_id": 454,
        "file_id": 1185,
        "id": 2854
    },
    {
        "video_files_id": 112,
        "file_id": 2298,
        "id": 2855
    },
    {
        "video_files_id": 112,
        "file_id": 1217,
        "id": 2856
    },
    {
        "video_files_id": 114,
        "file_id": 363,
        "id": 2857
    },
    {
        "video_files_id": 114,
        "file_id": 2300,
        "id": 2858
    }
]);
}
