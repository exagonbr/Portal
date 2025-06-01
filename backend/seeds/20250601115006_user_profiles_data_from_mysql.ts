/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: profile -> user_profiles
 * Gerado em: 2025-06-01T11:50:06.638Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('user_profiles').del();

  // Insere dados de exemplo do MySQL
  await knex('user_profiles').insert([
    {
        "id": 1,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "admin",
        "user_id": 1
    },
    {
        "id": 2,
        "avatar_color": "0b74b2",
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "argvini",
        "user_id": 2
    },
    {
        "id": 3,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "rafa",
        "user_id": 3
    },
    {
        "id": 2633,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "raquel.honda@professor.barueri.br",
        "user_id": 2774
    },
    {
        "id": 2634,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "galileia.silva@professor.barueri.br",
        "user_id": 2773
    },
    {
        "id": 2635,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "patricia.csantos@professor.barueri.br",
        "user_id": 2769
    },
    {
        "id": 2636,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "jose.rocha@professor.barueri.br",
        "user_id": 2770
    },
    {
        "id": 2637,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "edvaldo.ananias@professor.barueri.br",
        "user_id": 2771
    },
    {
        "id": 2638,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "vania.garcia@professor.barueri.br",
        "user_id": 2772
    },
    {
        "id": 2639,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "enides.carvalho@professor.barueri.br",
        "user_id": 2777
    },
    {
        "id": 2640,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "isabel.camilo@professor.barueri.br",
        "user_id": 2775
    },
    {
        "id": 2641,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "antonio.souza@professor.barueri.br",
        "user_id": 2778
    },
    {
        "id": 2642,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "joice.maciel@professor.barueri.br",
        "user_id": 2779
    },
    {
        "id": 2643,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "carla.vilao@professor.barueri.br",
        "user_id": 2776
    },
    {
        "id": 2644,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "joselma.silva@professor.barueri.br",
        "user_id": 2780
    },
    {
        "id": 2645,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "super.anacamolezzi@educbarueri.sp.gov.br",
        "user_id": 2782
    },
    {
        "id": 2646,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "maria.monzani@professor.barueri.br",
        "user_id": 2781
    },
    {
        "id": 2647,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "aline.bitencourte@professor.barueri.br",
        "user_id": 2783
    },
    {
        "id": 2648,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "girlane.sampaio@professor.barueri.br",
        "user_id": 2786
    },
    {
        "id": 2649,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "adriane.faias@professor.barueri.br",
        "user_id": 2785
    },
    {
        "id": 2650,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "suzelaine.pajares@professor.barueri.br",
        "user_id": 2784
    },
    {
        "id": 2651,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "luis.aoliveira@professor.barueri.br",
        "user_id": 2791
    },
    {
        "id": 2652,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "giovana.mello@professor.barueri.br",
        "user_id": 2787
    },
    {
        "id": 2653,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "super.marciapereira@educbarueri.sp.gov.br",
        "user_id": 2790
    },
    {
        "id": 2654,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "dtgp.mariabeatriz@educbarueri.sp.gov.br",
        "user_id": 2789
    },
    {
        "id": 2655,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "ac.conceicaotrevisan@educbarueri.sp.gov.br",
        "user_id": 2792
    },
    {
        "id": 2656,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "yula.moreira@professor.barueri.br",
        "user_id": 2794
    },
    {
        "id": 2657,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "fernanda.fraga@professor.barueri.br",
        "user_id": 2793
    },
    {
        "id": 2658,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "roseli.santana@professor.barueri.br",
        "user_id": 2788
    },
    {
        "id": 2659,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "adm.evandrofurquim@educbarueri.sp.gov.br",
        "user_id": 2796
    },
    {
        "id": 2660,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "ac.margaretepedroso@educbarueri.sp.gov.br",
        "user_id": 2795
    },
    {
        "id": 2661,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "super.tatianadias@educbarueri.sp.gov.br",
        "user_id": 2797
    },
    {
        "id": 2662,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "ana.msilva@professor.barueri.br",
        "user_id": 2798
    },
    {
        "id": 2663,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "leia.armani@professor.barueri.br",
        "user_id": 2800
    },
    {
        "id": 2664,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "dtgp.suelypuya@educbarueri.sp.gov.br",
        "user_id": 2799
    },
    {
        "id": 2665,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "super.alessandratavares@educbarueri.sp.gov.br",
        "user_id": 2802
    },
    {
        "id": 2666,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "super.wagneros@educbarueri.sp.gov.br",
        "user_id": 2804
    },
    {
        "id": 2667,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "dtgp.silviaboni@educbarueri.sp.gov.br",
        "user_id": 2801
    },
    {
        "id": 2668,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "super.mariajose@educbarueri.sp.gov.br",
        "user_id": 2805
    },
    {
        "id": 2669,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "katia.camargo@professor.barueri.br",
        "user_id": 2808
    },
    {
        "id": 2670,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "luis.vinuto@professor.barueri.br",
        "user_id": 2803
    },
    {
        "id": 2671,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "cef.lilianeburin@educbarueri.sp.gov.br",
        "user_id": 2807
    },
    {
        "id": 2672,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "sandra.placencio@professor.barueri.br",
        "user_id": 2810
    },
    {
        "id": 2673,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "margarete.silva@professor.barueri.br",
        "user_id": 2806
    },
    {
        "id": 2674,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "karine.exel@professor.barueri.br",
        "user_id": 2809
    },
    {
        "id": 2675,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "carolina.moraes@professor.barueri.br",
        "user_id": 2812
    },
    {
        "id": 2676,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "regiani.cerqueira@professor.barueri.br",
        "user_id": 2811
    },
    {
        "id": 2677,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "ana.ibrain@professor.barueri.br",
        "user_id": 2814
    },
    {
        "id": 2678,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "flavia.fraga@professor.barueri.br",
        "user_id": 2815
    },
    {
        "id": 2679,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "solange.ribeiro@professor.barueri.br",
        "user_id": 2813
    },
    {
        "id": 2680,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "ranis.oliveira@professor.barueri.br",
        "user_id": 2817
    },
    {
        "id": 2681,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "super.celiosimoes@educbarueri.sp.gov.br",
        "user_id": 2819
    },
    {
        "id": 2682,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "romulo.santos@professor.barueri.br",
        "user_id": 2816
    },
    {
        "id": 2683,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "super.joseferreira@educbarueri.sp.gov.br",
        "user_id": 2820
    },
    {
        "id": 2684,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "ti.dimascampos@educbarueri.sp.gov.br",
        "user_id": 2821
    },
    {
        "id": 2685,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "dee.gislaineleite@educbarueri.sp.gov.br",
        "user_id": 2818
    },
    {
        "id": 2686,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "rosangela.abreu@professor.barueri.br",
        "user_id": 2823
    },
    {
        "id": 2687,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "marcio.silva@professor.barueri.br",
        "user_id": 2824
    },
    {
        "id": 2688,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "ti.romualdominetto@educbarueri.sp.gov.br",
        "user_id": 2825
    },
    {
        "id": 2689,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "michele.nunes@professor.barueri.br",
        "user_id": 2826
    },
    {
        "id": 2690,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "josie.rocha@professor.barueri.br",
        "user_id": 2827
    },
    {
        "id": 2691,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "monica.santos@professor.barueri.br",
        "user_id": 2828
    },
    {
        "id": 2692,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "leila.carvalho@professor.barueri.br",
        "user_id": 2829
    },
    {
        "id": 2693,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "marinalva.macedo2@professor.barueri.br",
        "user_id": 2830
    },
    {
        "id": 2694,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "super.marlytoledo@educbarueri.sp.gov.br",
        "user_id": 2832
    },
    {
        "id": 2695,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "camila.mariano@professor.barueri.br",
        "user_id": 2834
    },
    {
        "id": 2696,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "sololaina@gmail.com",
        "user_id": 2833
    },
    {
        "id": 2697,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "cei.vivianemesquita@educbarueri.sp.gov.br",
        "user_id": 2831
    },
    {
        "id": 2698,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "dap.nancisantanna@educbarueri.sp.gov.br",
        "user_id": 2835
    },
    {
        "id": 2699,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "dpve.elizangelasoares@educbarueri.sp.gov.br",
        "user_id": 2838
    },
    {
        "id": 2700,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "maria.leitao@professor.barueri.br",
        "user_id": 2839
    },
    {
        "id": 2701,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "dee.elainebarbieri@educbarueri.sp.gov.br",
        "user_id": 2840
    },
    {
        "id": 2702,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "edinelia.silva@professor.barueri.br",
        "user_id": 2843
    },
    {
        "id": 2703,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "suely.kaguia@professor.barueri.br",
        "user_id": 2841
    },
    {
        "id": 2704,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "neide.kapur@professor.barueri.br",
        "user_id": 2846
    },
    {
        "id": 2705,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "patricia.andrade@professor.barueri.br",
        "user_id": 2845
    },
    {
        "id": 2706,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "alessandro.moraes@professor.barueri.br",
        "user_id": 2847
    },
    {
        "id": 2707,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "mery.ramalho@professor.barueri.br",
        "user_id": 2848
    },
    {
        "id": 2708,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "claudia.marsal@educacao.barueri.br",
        "user_id": 2851
    },
    {
        "id": 2709,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "educ.atendimentoescolar4@educbarueri.sp.gov.br",
        "user_id": 2853
    },
    {
        "id": 2710,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "super.ineslima@educbarueri.sp.gov.br",
        "user_id": 2852
    },
    {
        "id": 2711,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "valderez.santos@professor.barueri.br",
        "user_id": 2855
    },
    {
        "id": 2712,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "joceilma.melo@gmail.com",
        "user_id": 2856
    },
    {
        "id": 2713,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "cultura.anapaula@barueri.sp.gov.br",
        "user_id": 2859
    },
    {
        "id": 2714,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "gabriela.tinoco@professor.barueri.br",
        "user_id": 2861
    },
    {
        "id": 2715,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "maria.antunes@professor.barueri.br",
        "user_id": 2862
    },
    {
        "id": 2716,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "cibele.cornegruta@professor.barueri.br",
        "user_id": 2860
    },
    {
        "id": 2717,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "sueli.freitas@professor.barueri.br",
        "user_id": 2863
    },
    {
        "id": 2718,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "tarcilia.bueno@professor.barueri.br",
        "user_id": 2864
    },
    {
        "id": 2719,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "maria.slopes@professor.barueri.br",
        "user_id": 2865
    },
    {
        "id": 2720,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "fabiana.nunes@professor.barueri.br",
        "user_id": 2866
    },
    {
        "id": 2721,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "thaiz.madeira@professor.barueri.br",
        "user_id": 2867
    },
    {
        "id": 2722,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "darciany.moura@professor.barueri.br",
        "user_id": 2871
    },
    {
        "id": 2723,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "jessica.cardoso@professor.barueri.br",
        "user_id": 2868
    },
    {
        "id": 2724,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "lourdes.santos@professor.barueri.br",
        "user_id": 2870
    },
    {
        "id": 2725,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "maria.hora@professor.barueri.br",
        "user_id": 2872
    },
    {
        "id": 2726,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "cristiana.vieira@professor.barueri.br",
        "user_id": 2869
    },
    {
        "id": 2727,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "maria.aoliveira@professor.barueri.br",
        "user_id": 2873
    },
    {
        "id": 2728,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "fabiana.cavalcante@professor.barueri.br",
        "user_id": 2878
    },
    {
        "id": 2729,
        "avatar_color": null,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "profile_language": "pt",
        "profile_name": "carla.alfonso@professor.barueri.br",
        "user_id": 2880
    }
]);
}
