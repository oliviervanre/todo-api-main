<?php
namespace App\Controller;

use App\Entity\Task;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\DependencyInjection\Attribute\AsController;

#[AsController] // ✅ Ajoute cette ligne pour enregistrer le contrôleur
class TaskController extends AbstractController {

    //#[Route("/")]
    #[Route('/pwa', name: 'app_pwa')]
    public function index()
    {

        return $this->render('pwa/index.html.twig');

    }

    #[Route("/api/tasks", methods: ["POST"])]
    public function syncTasks(Request $request, EntityManagerInterface $em): JsonResponse {
        $data = json_decode($request->getContent(), true);
    
        if (!is_array($data)) {
            return new JsonResponse(["error" => "Invalid JSON format"], 400);
        }
    
        // Vérifier si c'est un seul objet ou un tableau d'objets
        if (isset($data["text"])) {
            // Cas d'une seule tâche
            $data = [$data]; // On le transforme en tableau pour simplifier la boucle
        }
    
        foreach ($data as $taskData) {
            if (!isset($taskData["text"])) {
                continue; // On ignore les entrées invalides
            }
    
            $task = new Task();
            $task->setText($taskData["text"]);
            $task->setCompleted($taskData["completed"] ?? false);
            $task->setUpdatedAt(new \DateTime());
    
            $em->persist($task);
        }
    
        $em->flush();
        return new JsonResponse(["status" => "success"], 200);
    }
    
    
}
?>